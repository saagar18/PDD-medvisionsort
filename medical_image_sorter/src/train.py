import os
import json
from src.utils import setup_logger

# Base directory of the project (one level up from src/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

logger = setup_logger("train")

CLASSES    = ["xray", "ct", "mri"]
IMG_SIZE   = (224, 224)
BATCH_SIZE = 4
EPOCHS     = 30


def train_model(data_dir=None, model_dir=None):
    if data_dir is None:
        data_dir = os.path.join(BASE_DIR, "dataset")
    if model_dir is None:
        model_dir = os.path.join(BASE_DIR, "model")
    """
    Train a MobileNetV2 classifier on:
        dataset/train/{ct,xray,mri}/   ← training images
        dataset/test/{ct,xray,mri}/    ← validation images

    Saves the model to model/medical_classifier.keras
    """
    # Lazy import — TF only loads when training is chosen
    import tensorflow as tf
    from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    from tensorflow.keras.optimizers import Adam

    train_dir = os.path.join(data_dir, "train")
    test_dir  = os.path.join(data_dir, "test")

    # Ensure class subfolders exist (so Keras doesn't error on empty dirs)
    for split in (train_dir, test_dir):
        for cls in CLASSES:
            os.makedirs(os.path.join(split, cls), exist_ok=True)

    train_gen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
    ).flow_from_directory(
        train_dir, target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode="categorical"
    )

    val_gen = ImageDataGenerator(rescale=1./255).flow_from_directory(
        test_dir, target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode="categorical"
    )

    if train_gen.samples == 0:
        logger.error(
            "No training images found.\n"
            "  Add images to:  dataset/train/ct/\n"
            "                  dataset/train/xray/\n"
            "                  dataset/train/mri/"
        )
        return

    # ── Build model ──────────────────────────────────────────────────────────
    logger.info("Building Custom Medical CNN model...")
    model = Sequential([
        Conv2D(32, (3, 3), activation="relu", input_shape=(224, 224, 3)),
        MaxPooling2D((2, 2)),
        Conv2D(64, (3, 3), activation="relu"),
        MaxPooling2D((2, 2)),
        Conv2D(128, (3, 3), activation="relu"),
        MaxPooling2D((2, 2)),
        Flatten(),
        Dense(128, activation="relu"),
        Dropout(0.5),
        Dense(len(CLASSES), activation="softmax")
    ])
    model.compile(optimizer=Adam(1e-4), loss="categorical_crossentropy", metrics=["accuracy"])

    # ── Train ─────────────────────────────────────────────────────────────────
    logger.info(f"Training for {EPOCHS} epochs...")
    model.fit(train_gen, epochs=EPOCHS, validation_data=val_gen)

    loss, acc = model.evaluate(val_gen)
    logger.info(f"Validation → loss: {loss:.4f}, accuracy: {acc:.4f}")

    # ── Save ──────────────────────────────────────────────────────────────────
    os.makedirs(model_dir, exist_ok=True)
    save_path = os.path.join(model_dir, "medical_classifier.keras")
    model.save(save_path)
    logger.info(f"Model saved → {save_path}")

    indices_path = os.path.join(model_dir, "class_indices.json")
    with open(indices_path, "w") as f:
        json.dump(train_gen.class_indices, f)
    logger.info(f"Class map  → {indices_path}")
