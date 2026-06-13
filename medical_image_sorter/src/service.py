import os
import uuid
import shutil
import threading
from datetime import datetime
from src.predict import MedicalClassifier
from src.database import SessionLocal, ProcessedFile
from src.utils import setup_logger

logger = setup_logger("service")

class ClassificationService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ClassificationService, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self, base_dir=None):
        if self._initialized:
            return
            
        self.base_dir = base_dir or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.sorted_dir = os.path.join(self.base_dir, "sorted")
        self.unclassified_dir = os.path.join(self.base_dir, "unclassified")
        
        # Ensure directories exist
        os.makedirs(self.sorted_dir, exist_ok=True)
        os.makedirs(self.unclassified_dir, exist_ok=True)
        for cat in ["ct", "mri", "xray"]:
            os.makedirs(os.path.join(self.sorted_dir, cat), exist_ok=True)
            
        logger.info("Pre-loading MedicalClassifier model into memory (Singleton)...")
        self.classifier = MedicalClassifier()
        self._initialized = True

    def process_file(self, temp_path, original_filename, patient_id="", patient_name=""):
        """
        Unified classification pipeline:
        1. Validates file extension.
        2. Runs ML model inference.
        3. Applies 85% threshold → moves to sorted/ or unclassified/.
        4. Logs result in SQLite with patient info.
        5. Returns dict ready for JSON response and Firestore save.
        """
        # Validate extension
        filename = original_filename or os.path.basename(temp_path)
        base_name, ext = os.path.splitext(filename)
        ext = ext.lower()
        
        if ext not in {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}:
            # VULN-F FIX: log extension type only, not the filename
            logger.error("Unsupported file format received: %s", ext)
            raise ValueError(f"Unsupported file format: {ext}")
            
        try:
            # Execute inference
            label, confidence = self.classifier.predict(temp_path)
            if label is None:
                raise RuntimeError("AI model classification failed.")
                
            # Deconflict and establish unique assigned filename
            unique_id = str(uuid.uuid4())
            assigned_filename = f"{base_name}_{unique_id}{ext}"
            
            # Apply 85% threshold
            if confidence >= 0.85 and label in {"ct", "mri", "xray"}:
                scan_type = label
                dest_dir = os.path.join(self.sorted_dir, scan_type)
                storage_path = f"{scan_type}/{assigned_filename}"
            else:
                scan_type = "unknown"
                dest_dir = self.unclassified_dir
                storage_path = f"unclassified/{assigned_filename}"
                # VULN-F FIX: do not log filename or confidence inline — use opaque job ref
                logger.info("Scan routed to unclassified (low confidence or unknown label).")
                
            os.makedirs(dest_dir, exist_ok=True)
            dest_path = os.path.join(dest_dir, assigned_filename)
            
            # Atomic file relocation
            shutil.move(temp_path, dest_path)
            # VULN-F FIX: log category/type only — not the full destination path
            logger.info("File classified and moved to %s category.", scan_type)
            
            # DB entry creation
            db_record = ProcessedFile(
                id=unique_id,
                original_filename=filename,
                assigned_filename=assigned_filename,
                scan_type=scan_type,
                confidence_score=float(confidence),
                storage_path=storage_path,
                processed_at=datetime.utcnow(),
                patient_id=patient_id.strip() if patient_id else "",
                patient_name=patient_name.strip() if patient_name else ""
            )
            
            session = SessionLocal()
            try:
                session.add(db_record)
                session.commit()
                # Query/load fully to detach dict representation
                session.refresh(db_record)
                result_dict = db_record.to_dict()
                return result_dict
            except Exception as e:
                session.rollback()
                # VULN-F FIX: log exception type only, not the message (may contain paths)
                logger.error("Failed to save record to database: %s", type(e).__name__)
                raise e
            finally:
                session.close()
                
        except Exception as e:
            # VULN-F FIX: log exception type only — do not include filename or exception text
            logger.error("Pipeline error during classification: %s", type(e).__name__)
            raise e
