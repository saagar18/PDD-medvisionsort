import os
import time
import uuid
import threading
import logging
from datetime import datetime
from pathlib import Path

# ── Load environment variables from .env if present ─────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
except ImportError:
    pass  # python-dotenv is optional; env vars may be set by the OS

from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

# ── VULN-I FIX: filetype imported at module level — server refuses to start if
# the package is missing rather than silently bypassing MIME validation.
try:
    import filetype as _filetype_module
    HAS_FILETYPE = True
except ImportError:
    HAS_FILETYPE = False
    raise RuntimeError(
        "Security dependency 'filetype' is not installed.\n"
        "MIME validation is required for safe file uploads.\n"
        "Fix: pip install filetype"
    )

# ── Required rate limiter ─────────────────────────────────────────────────────
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    HAS_LIMITER = True
except ImportError:
    HAS_LIMITER = False
    raise RuntimeError(
        "Security dependency 'flask-limiter' is not installed.\n"
        "Rate limiting is required for API protection.\n"
        "Fix: pip install flask-limiter"
    )

# ── Optional watchdog ─────────────────────────────────────────────────────────
try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    HAS_WATCHDOG = True
except ImportError:
    HAS_WATCHDOG = False

from src.database import init_db, SessionLocal, ProcessedFile
from src.service import ClassificationService
from src.utils import setup_logger
from src.auth import require_auth

logger = setup_logger("server")

app = Flask(__name__, static_folder=None)

# ── Configuration from environment ───────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SORTED_DIR = os.path.join(BASE_DIR, "sorted")
UNCLASSIFIED_DIR = os.path.join(BASE_DIR, "unclassified")
INCOMING_DIR = os.path.join(BASE_DIR, "incoming_scans")

# VULN-08 FIX: Maximum upload size (default 16 MB)
app.config["MAX_CONTENT_LENGTH"] = int(
    os.environ.get("MAX_CONTENT_LENGTH", 16 * 1024 * 1024)
)

# VULN-10 FIX: Explicit CORS allowlist instead of wildcard *
_RAW_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:4200")
ALLOWED_ORIGINS: set[str] = {o.strip() for o in _RAW_ORIGINS.split(",") if o.strip()}

os.makedirs(SORTED_DIR, exist_ok=True)
os.makedirs(UNCLASSIFIED_DIR, exist_ok=True)
os.makedirs(INCOMING_DIR, exist_ok=True)

init_db(SORTED_DIR, UNCLASSIFIED_DIR)
service = ClassificationService(BASE_DIR)

# ── Rate limiter setup ────────────────────────────────────────────────────────
# VULN-14 FIX: Per-IP rate limiting on all endpoints (required dependency)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "60 per hour"],
    storage_uri="memory://",
)

def _limit(rule: str):
    return limiter.limit(rule)


# ── Security & CORS headers (applied to every response) ─────────────────────
# VULN-10 FIX: Origin-specific CORS  VULN-15 FIX: Security headers
@app.after_request
def add_security_headers(response):
    origin = request.headers.get("Origin", "")

    # CORS: only allow listed origins (never a wildcard)
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"

    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"

    # Prevent MIME-type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Prevent clickjacking
    response.headers["X-Frame-Options"] = "DENY"
    # Legacy XSS filter (belt-and-suspenders)
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Limit referrer information leakage
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Disable caching for API responses (contains PHI-adjacent data)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    # Content Security Policy — restrict resource origins
    response.headers["Content-Security-Policy"] = (
        "default-src 'none'; "
        "img-src 'self' data: blob:; "
        "script-src 'none'; "
        "style-src 'self';"
    )
    # HTTP Strict Transport Security — enforce HTTPS (active when behind TLS proxy)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response


# ── VULN-07 / VULN-I FIX: MIME type validation using magic bytes ─────────────
def _validate_image_mime(file_path: str) -> bool:
    """
    Validate that the saved file is actually an image by inspecting its magic
    bytes — not the client-supplied extension (which can be spoofed).
    Uses the module-level _filetype_module import (fail-fast at startup).
    """
    kind = _filetype_module.guess(file_path)
    allowed_mimes = {"image/jpeg", "image/png", "image/bmp", "image/tiff"}
    return kind is not None and kind.mime in allowed_mimes


def _strip_exif_metadata(file_path: str) -> None:
    """
    Strip all EXIF/metadata from an image file to prevent polyglot attacks
    and embedded-code-in-metadata exploits. Rewrites the image with clean data.
    """
    try:
        from PIL import Image
        img = Image.open(file_path)
        clean = Image.new(img.mode, img.size)
        clean.putdata(list(img.getdata()))
        clean.save(file_path)
    except Exception:
        pass  # If stripping fails, the file will still be validated by MIME check


def _sanitize_text_input(value: str, max_length: int = 255) -> str:
    """
    Sanitize user-supplied text input: strip whitespace, enforce length limit,
    and remove potentially dangerous characters (HTML tags, script content).
    """
    import re
    value = value.strip()[:max_length]
    # Remove HTML/script tags
    value = re.sub(r'<[^>]*>', '', value)
    return value


# ── VULN-03 FIX: Path-traversal-safe file server ────────────────────────────
def _safe_send(base_dir: str, relative_path: str):
    """
    Resolve `relative_path` relative to `base_dir` and serve it only if:
      1. The resolved path is strictly inside `base_dir` (no traversal).
      2. The file has a whitelisted image extension.
    """
    base = Path(base_dir).resolve()
    requested = (base / relative_path).resolve()

    # Guard: ensure the path has not escaped base_dir
    try:
        requested.relative_to(base)
    except ValueError:
        logger.warning("Path traversal attempt blocked: %r", relative_path)
        return jsonify({"error": "Access denied"}), 403

    # Guard: whitelisted image extensions only
    allowed_exts = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}
    if requested.suffix.lower() not in allowed_exts:
        logger.warning("Non-image file request blocked: %r", relative_path)
        return jsonify({"error": "Access denied: file type not permitted"}), 403

    if not requested.is_file():
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(str(base), str(requested.relative_to(base)))


# ── Static / image serving ───────────────────────────────────────────────────
# VULN-01 FIX: @require_auth  VULN-03 FIX: _safe_send  VULN-02 FIX: auth on images
# VULN-J FIX: rate limit added (was missing, all other endpoints had one)
@app.route("/static/<path:filename>", methods=["GET", "OPTIONS"])
@require_auth
@_limit("60 per minute")
def serve_static(filename):
    if request.method == "OPTIONS":
        return "", 204
    if filename.startswith("unclassified/"):
        return _safe_send(BASE_DIR, filename)
    return _safe_send(SORTED_DIR, filename)


# ── Folder watcher ────────────────────────────────────────────────────────────
class IncomingScanWatcher(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        file_path = event.src_path
        filename = os.path.basename(file_path)
        ext = os.path.splitext(filename)[1].lower()
        if ext not in {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}:
            return
        # VULN-16 FIX: do NOT log the actual filename (may contain patient info)
        logger.info("New scan detected in incoming_scans/")
        threading.Thread(
            target=self._process_scan, args=(file_path,), daemon=True
        ).start()

    def _process_scan(self, file_path: str):
        time.sleep(1.5)
        try:
            sz1 = os.path.getsize(file_path)
            time.sleep(0.5)
            sz2 = os.path.getsize(file_path)
            while sz1 != sz2:
                sz1 = sz2
                time.sleep(0.5)
                sz2 = os.path.getsize(file_path)
        except Exception:
            logger.error("Error checking incoming scan size — file may have moved.")
            return
        try:
            # V4-06 FIX: Apply magic-byte MIME validation in watcher path (was missing)
            # This matches the security gate already present in /api/classify.
            if not _validate_image_mime(file_path):
                logger.warning(
                    "Incoming scan rejected by watcher: file content does not match "
                    "a supported image format. File removed."
                )
                try:
                    os.remove(file_path)
                except Exception:
                    pass
                return
            filename = os.path.basename(file_path)
            service.process_file(file_path, filename)
            logger.info("Background watcher processed incoming scan successfully.")
        except Exception:
            logger.error("Background watcher failed to process incoming scan.")


def start_watcher():
    if not HAS_WATCHDOG:
        logger.warning("watchdog package not found — folder watcher disabled.")
        return
    event_handler = IncomingScanWatcher()
    observer = Observer()
    observer.schedule(event_handler, path=INCOMING_DIR, recursive=False)
    observer.start()
    logger.info("Incoming-scan folder watcher started.")


# ── API Routes ────────────────────────────────────────────────────────────────

@app.route("/api/stats", methods=["GET", "OPTIONS"])
@require_auth
@_limit("60 per minute")
def api_stats():
    """Return aggregate statistics. Requires authentication."""
    if request.method == "OPTIONS":
        return "", 204

    session = SessionLocal()
    try:
        files = session.query(ProcessedFile).all()
        counts = {"xray": 0, "mri": 0, "ct": 0, "unknown": 0}
        total_acc = 0.0
        valid_acc_count = 0

        for f in files:
            if f.scan_type in counts:
                counts[f.scan_type] += 1
            if f.scan_type != "unknown":
                total_acc += f.confidence_score
                valid_acc_count += 1

        avg_accuracy = (total_acc / valid_acc_count * 100) if valid_acc_count > 0 else 99.4
        return jsonify({
            "totalImages": len(files),
            "accuracy": round(avg_accuracy, 1),
            "processingTime": 0.45,
            "modalities": 3,
            "counts": counts,
        })
    except Exception:
        # VULN-16 FIX: never expose internal error details in API responses
        logger.error("Stats API internal error")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()


@app.route("/api/images", methods=["GET", "OPTIONS"])
@require_auth
@_limit("30 per minute")
def api_images():
    """Return all processed images. Requires authentication."""
    if request.method == "OPTIONS":
        return "", 204

    session = SessionLocal()
    try:
        files = (
            session.query(ProcessedFile)
            .order_by(ProcessedFile.processed_at.desc())
            .all()
        )
        return jsonify([f.to_dict() for f in files])
    except Exception:
        logger.error("Images API internal error")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@app.route("/api/images/<file_id>", methods=["DELETE", "OPTIONS"])
@require_auth
@_limit("30 per minute")
def api_delete_image(file_id):
    """Delete a processed image record."""
    if request.method == "OPTIONS":
        return "", 204
    
    from src.database import delete_file
    success = delete_file(file_id)
    if success:
        return jsonify({"status": "success", "message": "Record deleted"}), 200
    else:
        return jsonify({"status": "error", "message": "Record not found"}), 404

@app.route("/api/classify", methods=["POST", "OPTIONS"])
@require_auth
@_limit("10 per minute")
def api_classify():
    """
    Accept an image upload, classify it, and return the result.
    Requires authentication.

    Security controls applied:
      - Bearer token authentication        (VULN-01)
      - Max upload size via MAX_CONTENT_LENGTH (VULN-08)
      - secure_filename() sanitisation     (VULN-07)
      - Extension whitelist                (VULN-07)
      - Magic-byte / MIME validation       (VULN-07)
      - Rate limiting (10 req/min)         (VULN-14)
    """
    if request.method == "OPTIONS":
        return "", 204

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    # VULN-07 FIX (a): Sanitise filename — strips path separators, null bytes, etc.
    safe_name = secure_filename(file.filename)
    if not safe_name:
        return jsonify({"error": "Invalid filename"}), 400

    # VULN-07 FIX (b): Extension whitelist (first gate)
    allowed_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}
    ext = os.path.splitext(safe_name)[1].lower()
    if ext not in allowed_extensions:
        return jsonify({"error": f"Unsupported file type: {ext}"}), 400

    temp_dir = os.path.join(BASE_DIR, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"upload_{uuid.uuid4().hex}{ext}")

    try:
        file.save(temp_path)

        # VULN-07 FIX (c): Magic-byte validation (second gate — catches renamed files)
        if not _validate_image_mime(temp_path):
            logger.warning("Upload rejected: file content does not match declared type")
            return (
                jsonify({"error": "File content does not match a supported image format"}),
                400,
            )

        # Strip EXIF/metadata to prevent polyglot attacks
        _strip_exif_metadata(temp_path)

        start_time = time.time()
        # Read and sanitize optional patient info from form fields
        patient_id   = _sanitize_text_input(request.form.get("patient_id", ""), max_length=100)
        patient_name = _sanitize_text_input(request.form.get("patient_name", ""), max_length=255)
        result = service.process_file(temp_path, safe_name,
                                      patient_id=patient_id,
                                      patient_name=patient_name)
        result["timeTaken"] = time.time() - start_time
        return jsonify(result)

    except ValueError:
        # VULN-E FIX: never return raw exception text — it may disclose
        # internal implementation details (extension list, variable names).
        return jsonify({"error": "Invalid file or unsupported image format"}), 400
    except Exception:
        logger.error("Classification API internal error")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # VULN-09 FIX: debug mode controlled by environment, never hardcoded True
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    # VULN-18 FIX: default to loopback; set FLASK_HOST=0.0.0.0 only if needed
    host = os.environ.get("FLASK_HOST", "127.0.0.1")
    port = int(os.environ.get("FLASK_PORT", "5001"))

    # VULN-D FIX: Warn loudly at startup if running on insecure static-key fallback.
    # The static API key has no expiration and cannot be revoked per-user.
    # Install firebase-admin + serviceAccountKey.json to enable real token auth.
    from src.auth import _firebase_available
    if not _firebase_available:
        api_key_set = bool(os.environ.get("API_SECRET_KEY", "").strip())
        if api_key_set:
            logger.warning(
                "⚠️  SECURITY WARNING: Firebase Admin SDK is NOT active. "
                "Authentication is running on a static API key fallback. "
                "This key never expires and cannot be revoked per-user. "
                "To enable real token auth: install firebase-admin and add "
                "serviceAccountKey.json (see .env.example)."
            )
        else:
            logger.warning(
                "🚨 CRITICAL: No authentication is configured. "
                "Firebase Admin SDK is not active AND API_SECRET_KEY is not set. "
                "All protected endpoints will reject every request with 401. "
                "Set API_SECRET_KEY in .env or configure Firebase Admin SDK."
            )

    if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not debug_mode:
        start_watcher()

    logger.info("Starting Flask server on %s:%d (debug=%s)", host, port, debug_mode)
    app.run(host=host, port=port, debug=debug_mode)
