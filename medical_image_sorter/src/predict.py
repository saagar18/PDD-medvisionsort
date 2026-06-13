import os
import json
import shutil
import numpy as np
from src.utils import preprocess_image, setup_logger

# Project root (one level up from src/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

logger = setup_logger("predict")

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}


class MedicalClassifier:
    """Loads a trained Keras model and predicts scan type (ct / mri / xray)."""

    def __init__(self, model_dir=None):
        if model_dir is None:
            model_dir = os.path.join(BASE_DIR, "model")
        self.model = None
        self.labels = {}
        self._load(model_dir)

    def _load(self, model_dir):
        from tensorflow.keras.models import load_model

        # Try .keras first, fall back to legacy .h5
        for ext in ("medical_classifier.keras", "medical_classifier.h5"):
            path = os.path.join(model_dir, ext)
            if os.path.exists(path):
                try:
                    self.model = load_model(path)
                    logger.info("Model loaded successfully.")
                except Exception as e:
                    # VULN-F FIX: log exception type only, not the full message
                    logger.error("Failed to load model: %s", type(e).__name__)
                    return
                break

        if self.model is None:
            logger.error("No model found in 'model/'. Run option 1 to train first.")
            return

        indices_path = os.path.join(model_dir, "class_indices.json")
        if os.path.exists(indices_path):
            with open(indices_path) as f:
                self.labels = {v: k for k, v in json.load(f).items()}
        else:
            self.labels = {0: "ct", 1: "mri", 2: "xray"}
            logger.warning("class_indices.json missing — using default label order.")

    def predict(self, image_path):
        """Return (label, confidence) for one image, or (None, 0.0) on failure."""
        if self.model is None:
            return None, 0.0
        img = preprocess_image(image_path)
        if img is None:
            return None, 0.0

        img = img / 255.0
        img = np.expand_dims(img, axis=0)

        try:
            preds = self.model.predict(img, verbose=0)
            class_id = int(np.argmax(preds[0]))
            confidence = float(preds[0][class_id])
            label = self.labels.get(class_id, "unknown")
            # VULN-F FIX: log classification outcome without the filename
            logger.info("Prediction complete: %s (%.0f%%)", label, confidence * 100)
            return label, confidence
        except Exception as e:
            # VULN-F FIX: log exception type, not the message (may contain path)
            logger.error("Prediction error: %s", type(e).__name__)
            return None, 0.0


def sort_folder(input_dir, sorted_dir=None):
    if sorted_dir is None:
        sorted_dir = os.path.join(BASE_DIR, "sorted")
    """
    Classify every image in *input_dir* and move it to sorted/<label>/.
    Works on dataset/test/ or any plain folder of unsorted images.
    """
    # Resolve relative paths against the project root, not the shell's CWD
    if not os.path.isabs(input_dir):
        input_dir = os.path.join(BASE_DIR, input_dir)

    if not os.path.isdir(input_dir):
        print(f"  ✗ Folder not found: '{input_dir}'")
        return

    classifier = MedicalClassifier()
    if classifier.model is None:
        return

    # Collect all images (flat or one-level subfolders)
    images = []
    for root, _, files in os.walk(input_dir):
        for f in files:
            if os.path.splitext(f)[1].lower() in VALID_EXTENSIONS:
                images.append(os.path.join(root, f))

    if not images:
        print(f"  No images found in '{input_dir}'.")
        return

    print(f"\n  Found {len(images)} image(s). Sorting...\n")
    ok = fail = 0

    for img_path in images:
        label, confidence = classifier.predict(img_path)
        if label is None:
            print(f"  ✗ Could not classify: {os.path.basename(img_path)}")
            fail += 1
            continue

        dest_dir = os.path.join(sorted_dir, label)
        os.makedirs(dest_dir, exist_ok=True)
        dest = os.path.join(dest_dir, os.path.basename(img_path))
        try:
            shutil.copy2(img_path, dest)          # copy (keeps originals safe)
            print(f"  ✔ {os.path.basename(img_path):30s} → sorted/{label}/  ({confidence:.0%})")
            ok += 1
        except Exception as e:
            # VULN-F FIX: do not log the full source path
            logger.error("Copy failed during sort_folder: %s", type(e).__name__)
            fail += 1

    print(f"\n  Done — {ok} sorted, {fail} failed.")
    print(f"  Results are in: {os.path.abspath(sorted_dir)}/\n")
