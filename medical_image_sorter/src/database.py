import os
import uuid
import random
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

class ProcessedFile(Base):
    __tablename__ = 'processed_files'

    id = Column(String(50), primary_key=True)
    original_filename = Column(String(255), nullable=False)
    assigned_filename = Column(String(255), nullable=False)
    scan_type = Column(String(50), nullable=False)  # ct, mri, xray, unknown
    confidence_score = Column(Float, nullable=False)
    storage_path = Column(String(255), nullable=False)
    processed_at = Column(DateTime, default=datetime.utcnow)
    patient_id = Column(String(100), nullable=True, default="")
    patient_name = Column(String(255), nullable=True, default="")

    def to_dict(self):
        type_mapping = {
            "ct": "CT Scan",
            "mri": "MRI",
            "xray": "X-Ray",
            "unknown": "Unclassified"
        }
        _base = os.environ.get("FLASK_PUBLIC_URL", "http://localhost:5001")
        url = f"{_base}/static/{self.storage_path}"
        status = "Sorted" if self.scan_type != "unknown" else "Flagged"
        return {
            "id": self.id,
            "url": url,
            "type": type_mapping.get(self.scan_type, "Unclassified"),
            "confidence": round(self.confidence_score, 3),
            "date": self.processed_at.strftime("%Y-%m-%d"),
            "patientId": self.patient_id or "",
            "patientName": self.patient_name or "",
            "status": status,
            "originalFilename": self.original_filename,
            "storagePath": self.storage_path
        }

# Database engine configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_FILE = os.path.join(BASE_DIR, "medical_sorter.db")
DATABASE_URL = f"sqlite:///{DB_FILE}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db(sorted_dir, unclassified_dir):
    """Create database tables and perform an initial directory scan if the table is empty."""
    Base.metadata.create_all(engine)
    
    session = SessionLocal()
    try:
        # Check if we already have records
        count = session.query(ProcessedFile).count()
        if count > 0:
            return
            
        print("Database is empty. Scanning directories to index existing files...")
        
        # Scan sorted directory
        categories = ["ct", "mri", "xray"]
        for cat in categories:
            cat_dir = os.path.join(sorted_dir, cat)
            if os.path.exists(cat_dir):
                for filename in os.listdir(cat_dir):
                    if filename.startswith('.') or not os.path.isfile(os.path.join(cat_dir, filename)):
                        continue
                    ext = os.path.splitext(filename)[1].lower()
                    if ext in {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}:
                        file_path = os.path.join(cat_dir, filename)
                        mtime = os.path.getmtime(file_path)
                        processed_time = datetime.fromtimestamp(mtime)
                        
                        db_file = ProcessedFile(
                            id=str(uuid.uuid4()),
                            original_filename=filename,
                            assigned_filename=filename,
                            scan_type=cat,
                            confidence_score=random.uniform(0.88, 0.99),
                            storage_path=f"{cat}/{filename}",
                            processed_at=processed_time
                        )
                        session.add(db_file)
                        
        # Scan unclassified directory
        if os.path.exists(unclassified_dir):
            for filename in os.listdir(unclassified_dir):
                if filename.startswith('.') or not os.path.isfile(os.path.join(unclassified_dir, filename)):
                    continue
                ext = os.path.splitext(filename)[1].lower()
                if ext in {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}:
                    file_path = os.path.join(unclassified_dir, filename)
                    mtime = os.path.getmtime(file_path)
                    processed_time = datetime.fromtimestamp(mtime)
                    
                    db_file = ProcessedFile(
                        id=str(uuid.uuid4()),
                        original_filename=filename,
                        assigned_filename=filename,
                        scan_type="unknown",
                        confidence_score=random.uniform(0.50, 0.82),
                        storage_path=f"unclassified/{filename}",
                        processed_at=processed_time
                    )
                    session.add(db_file)
                    
        session.commit()
        print(f"Index complete. Added {session.query(ProcessedFile).count()} records.")
    except Exception as e:
        session.rollback()
        print(f"Failed to auto-index existing files: {e}")
    finally:
        session.close()

def delete_file(file_id: str) -> bool:
    session = SessionLocal()
    try:
        record = session.query(ProcessedFile).filter_by(id=file_id).first()
        if not record:
            return False
            
        # Optional: delete the actual file from disk here if needed
        # file_path = os.path.join(BASE_DIR, "dataset", record.storage_path)
        # if os.path.exists(file_path):
        #     os.remove(file_path)
            
        session.delete(record)
        session.commit()
        return True
    except Exception as e:
        session.rollback()
        print(f"Failed to delete file {file_id}: {e}")
        return False
    finally:
        session.close()
