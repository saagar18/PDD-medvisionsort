"""
auth.py — Backend Authentication Middleware
==========================================
Provides `require_auth` — a Flask route decorator that enforces bearer-token
authentication on every protected endpoint.

Two verification modes (auto-selected at startup):
  1. Firebase Admin SDK — verifies Firebase ID tokens issued by the Angular
     frontend.  Requires `serviceAccountKey.json` (download from Firebase
     Console → Project Settings → Service Accounts → Generate new private key).
  2. API Key fallback — compares the bearer token against the `API_SECRET_KEY`
     environment variable.  Useful when the Admin SDK is not yet configured.

Configure via environment variables (see .env.example):
  FIREBASE_SERVICE_ACCOUNT_PATH  path to serviceAccountKey.json
  API_SECRET_KEY                 fallback shared secret
"""

import os
import functools
from flask import request, jsonify
from src.utils import setup_logger

logger = setup_logger("auth")

# ── Firebase Admin SDK initialisation ────────────────────────────────────────
_firebase_available = False


def _init_firebase() -> bool:
    """Attempt to initialise Firebase Admin SDK. Returns True on success."""
    global _firebase_available

    service_account_path = os.environ.get(
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "serviceAccountKey.json",
        ),
    )

    try:
        import firebase_admin
        from firebase_admin import credentials

        if not os.path.exists(service_account_path):
            logger.warning(
                "serviceAccountKey.json not found. "
                "Firebase token verification is DISABLED. "
                "Set API_SECRET_KEY in .env for fallback auth, or download the "
                "service account key from Firebase Console → Project Settings → "
                "Service Accounts → Generate new private key."
            )
            return False

        # Only initialise once (guard against hot-reload double-init)
        if not firebase_admin._apps:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)

        _firebase_available = True
        logger.info("Firebase Admin SDK initialised — ID-token verification active.")
        return True

    except ImportError:
        logger.warning(
            "firebase-admin package not installed. "
            "Run: pip install firebase-admin"
        )
        return False
    except Exception as exc:
        logger.error("Firebase Admin SDK initialisation failed: %s", type(exc).__name__)
        return False


_firebase_available = _init_firebase()


# ── Token verification ────────────────────────────────────────────────────────

def _verify_firebase_token(token: str) -> bool:
    """Verify a Firebase ID token using the Admin SDK."""
    try:
        from firebase_admin import auth as firebase_auth
        decoded = firebase_auth.verify_id_token(token, check_revoked=True)
        return bool(decoded.get("uid"))
    except Exception:
        return False


def _verify_api_key(token: str) -> bool:
    """Verify against a static API secret key (fallback mode)."""
    api_key = os.environ.get("API_SECRET_KEY", "").strip()
    if not api_key:
        return False
    # Constant-time comparison to prevent timing attacks
    import hmac
    return hmac.compare_digest(token.encode(), api_key.encode())


def verify_token(token: str) -> bool:
    """
    Verify a bearer token.
    Tries Firebase Admin SDK first; falls back to API_SECRET_KEY.
    """
    if not token:
        return False

    if _firebase_available:
        return _verify_firebase_token(token)

    # Fallback: API key mode
    result = _verify_api_key(token)
    if not result:
        logger.warning(
            "Auth attempt failed — neither Firebase Admin SDK nor API_SECRET_KEY "
            "could validate the provided token."
        )
    return result


# ── Route decorator ────────────────────────────────────────────────────────────

def require_auth(f):
    """
    Flask route decorator that enforces bearer-token authentication.

    Usage:
        @app.route('/api/data')
        @require_auth
        def get_data():
            ...

    CORS preflight (OPTIONS) requests are passed through automatically.
    All other requests must include:
        Authorization: Bearer <firebase_id_token_or_api_key>
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        # CORS preflight — pass through without auth
        if request.method == "OPTIONS":
            return f(*args, **kwargs)

        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            logger.warning(
                "Rejected request to %s — missing/malformed Authorization header",
                request.path,
            )
            return (
                jsonify({"error": "Unauthorized: Authorization header required (Bearer <token>)"}),
                401,
            )

        token = auth_header[7:]  # Strip "Bearer "

        if not verify_token(token):
            logger.warning(
                "Rejected request to %s — invalid or expired token", request.path
            )
            return jsonify({"error": "Unauthorized: Invalid or expired token"}), 401

        return f(*args, **kwargs)

    return decorated
