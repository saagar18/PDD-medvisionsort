# Medical Image Sorter

A complete, runnable project for classifying and automatically sorting medical images (X-ray, CT scan, and MRI) using deep learning (MobileNetV2 CNN with transfer learning).

## 📁 Project Structure
The project has the following structure:
```
medical_image_sorter/
│
├── dataset/
│   ├── train/ (Populate with training images)
│   │   ├── xray/
│   │   ├── ct/
│   │   ├── mri/
│   ├── test/ (Populate with validation images)
│       ├── xray/
│       ├── ct/
│       ├── mri/
│
├── incoming_scans/ (Drop new images here for auto-sorting)
├── sorted/ (Images will be automatically moved here)
│   ├── xray/
│   ├── ct/
│   ├── mri/
│
├── model/ (Compiled trained model saves here)
│   ├── medical_classifier.h5
│   └── class_indices.json
│
├── src/
│   ├── train.py (Model training script)
│   ├── predict.py (Inference script)
│   ├── sorter.py (Sorting logic)
│   ├── watcher.py (Folder monitoring script)
│   └── utils.py (Common utilities)
│
├── requirements.txt
├── README.md
└── main.py (Entry point CLI)
```

## ⚙️ Setup Steps

1. **Install Dependencies:**
   Make sure you have Python 3.8+ installed. Then install the required libraries:
   ```bash
   pip install -r requirements.txt
   ```

2. **Prepare Dataset:**
   Place your labeled medical images into the appropriate directories under `dataset/train/` and `dataset/test/`. The model requires images in the subfolders: `xray`, `ct`, and `mri`.

## 🧠 How to Train

1. Run the main entry point:
   ```bash
   python main.py
   ```
2. Select option **1 (Train Model)**.
3. The system will load images from the dataset directory, compile a MobileNetV2-based model, and train it. 
4. The best model and class indices will be saved to the `model/` folder.

## 🚀 How to Run the Sorter

1. Run the main entry point:
   ```bash
   python main.py
   ```
2. Select option **2 (Run Real-time Sorter)**.
3. The system will initialize the `watchdog` and monitor the `incoming_scans/` folder.
4. **Action:** Drop any image (`.jpg`, `.png`, etc.) into `incoming_scans/`.
5. The system will automatically classify the image using the trained model and move it into the correct category folder within `sorted/`.
