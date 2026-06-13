import os
import logging
import cv2

# Project root is two levels up from this file (src/utils.py → medical_image_sorter/)
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def setup_logger(name, log_file="system.log", level=logging.INFO):
    """
    Configure a logger with file + console output.

    Security note (VULN-16 fix): The formatter intentionally omits the
    %(pathname)s and %(filename)s tokens.  Callers must NOT include raw file
    system paths or patient-identifiable filenames in log messages.
    """
    # Resolve relative log paths against the project root, not the shell CWD
    if not os.path.isabs(log_file):
        log_file = os.path.join(_PROJECT_ROOT, log_file)
    formatter = logging.Formatter(
        "%(asctime)s [%(name)s] %(levelname)s: %(message)s"
    )
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.propagate = False
    if not logger.handlers:
        fh = logging.FileHandler(log_file)
        fh.setFormatter(formatter)
        logger.addHandler(fh)
        ch = logging.StreamHandler()
        ch.setFormatter(formatter)
        logger.addHandler(ch)
    return logger


def preprocess_image(image_path, target_size=(224, 224)):
    """Read, convert to RGB float32, and resize an image for MobileNetV2."""
    logger = logging.getLogger("utils")
    try:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Cannot read image — file may be corrupt or unsupported.")
        if len(img.shape) == 2 or img.shape[2] == 1:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, target_size)
        return img.astype("float32")
    except Exception as e:
        # VULN-16 FIX: log a generic message — do not include the file path
        logger.error("Image preprocessing failed: %s", type(e).__name__)
        return None
