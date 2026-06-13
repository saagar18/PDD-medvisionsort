import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { DragDropZoneComponent } from '../../components/drag-drop-zone/drag-drop-zone';
import { backendConfig } from '../../backend-config';

interface ScanResult {
  type: string;
  confidence: number;
  timeTaken: number;
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  status: string;
  storagePath: string;
  url: string;
}

type Step = 'patient' | 'upload' | 'scanning' | 'result';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    DragDropZoneComponent
  ],
  template: `
    <main class="upload-page">
      <div class="page-header">
        <h1>Medical Image Capture</h1>
        <p>Enter patient details, upload a scan, and get instant AI classification</p>
      </div>

      <!-- ── STEP INDICATOR ── -->
      <div class="step-bar">
        <div class="step" [class.active]="step === 'patient'" [class.done]="stepDone('patient')">
          <div class="step-dot"><mat-icon>person</mat-icon></div>
          <span>Patient Info</span>
        </div>
        <div class="step-line" [class.done]="stepDone('patient')"></div>
        <div class="step" [class.active]="step === 'upload'" [class.done]="stepDone('upload')">
          <div class="step-dot"><mat-icon>upload_file</mat-icon></div>
          <span>Upload Scan</span>
        </div>
        <div class="step-line" [class.done]="stepDone('upload')"></div>
        <div class="step" [class.active]="step === 'scanning' || step === 'result'" [class.done]="step === 'result'">
          <div class="step-dot"><mat-icon>analytics</mat-icon></div>
          <span>AI Result</span>
        </div>
      </div>

      <!-- ══════════════════ STEP 1 — Patient Info ══════════════════ -->
      <div class="step-panel glass-panel" *ngIf="step === 'patient'">
        <div class="step-panel-header">
          <mat-icon>badge</mat-icon>
          <h2>Patient Information</h2>
          <p>Enter the patient details before uploading the scan</p>
        </div>

        <div class="patient-form">
          <mat-form-field appearance="outline" class="field-full">
            <mat-label>Patient ID</mat-label>
            <input matInput
                   placeholder="e.g. PID-1042"
                   [(ngModel)]="patientId"
                   name="patientId"
                   maxlength="50">
            <mat-icon matPrefix>tag</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="field-full">
            <mat-label>Patient Name</mat-label>
            <input matInput
                   placeholder="e.g. John Doe"
                   [(ngModel)]="patientName"
                   name="patientName"
                   maxlength="100">
            <mat-icon matPrefix>person_outline</mat-icon>
          </mat-form-field>
        </div>

        <div class="patient-form-actions">
          <button mat-flat-button class="btn-primary next-btn"
                  (click)="goToUpload()"
                  [disabled]="!patientId.trim() || !patientName.trim()">
            <mat-icon>arrow_forward</mat-icon>
            Continue to Upload
          </button>
        </div>
      </div>

      <!-- ══════════════════ STEP 2 — Upload Scan ══════════════════ -->
      <div class="step-panel glass-panel" *ngIf="step === 'upload'">
        <div class="patient-badge">
          <mat-icon>person_pin</mat-icon>
          <span><strong>{{ patientId }}</strong> — {{ patientName }}</span>
          <button mat-icon-button title="Edit patient" (click)="step = 'patient'" class="edit-btn">
            <mat-icon>edit</mat-icon>
          </button>
        </div>

        <app-drag-drop-zone
          *ngIf="!previewUrl"
          (fileSelected)="onFileSelected($event)"
        ></app-drag-drop-zone>

        <div class="preview-area" *ngIf="previewUrl">
          <div class="preview-header">
            <h3>File Preview</h3>
            <button mat-icon-button (click)="clearFile()"><mat-icon>close</mat-icon></button>
          </div>
          <div class="image-wrapper">
            <img [src]="previewUrl" alt="Scan Preview">
          </div>

          <div class="upload-actions">
            <button mat-stroked-button (click)="clearFile()" class="btn-outline">
              <mat-icon>swap_horiz</mat-icon> Change Image
            </button>
            <button mat-flat-button class="btn-primary analyse-btn" (click)="uploadAndScan()">
              <mat-icon>biotech</mat-icon> Process with AI
            </button>
          </div>
        </div>
      </div>

      <!-- ══════════════════ STEP 3 — Scanning / Result ══════════════════ -->
      <div class="step-panel glass-panel scanning-panel" *ngIf="step === 'scanning'">
        <div class="scan-animation">
          <div class="scan-ring"></div>
          <div class="scan-ring ring2"></div>
          <div class="scan-ring ring3"></div>
          <mat-icon class="scan-brain">psychology</mat-icon>
        </div>
        <h2>AI Analysis in Progress…</h2>
        <p>Processing scan for <strong>{{ patientName }}</strong> ({{ patientId }})</p>
        <div class="shimmer-stack">
          <div class="shimmer-box"></div>
          <div class="shimmer-box w60"></div>
          <div class="shimmer-box w80"></div>
        </div>
      </div>

      <!-- Error -->
      <div class="step-panel glass-panel error-panel" *ngIf="errorMessage">
        <mat-icon>error_outline</mat-icon>
        <h2>Analysis Failed</h2>
        <p>{{ errorMessage }}</p>
        <div class="error-actions">
          <button mat-stroked-button class="btn-outline" (click)="retry()">
            <mat-icon>refresh</mat-icon> Retry
          </button>
          <button mat-flat-button class="btn-primary" (click)="startOver()">
            <mat-icon>home</mat-icon> Start Over
          </button>
        </div>
      </div>

      <!-- ══════════════════ RESULT CARD ══════════════════ -->
      <div class="result-card" *ngIf="step === 'result' && scanResult">

        <!-- Saved badge -->
        <div class="saved-notice" *ngIf="savedToDatabase">
          <mat-icon>cloud_done</mat-icon>
          Result saved to Database — visible on Dashboard
        </div>

        <!-- Header -->
        <div class="rc-header glass-panel">
          <div class="rc-header-left">
            <div class="rc-icon-wrap">
              <mat-icon>verified</mat-icon>
            </div>
            <div>
              <h2>AI Analysis Complete</h2>
              <p>Scan classified successfully</p>
            </div>
          </div>
          <span class="status-badge" [class]="'badge-' + (scanResult.status || 'sorted').toLowerCase()">
            {{ scanResult.status || 'Sorted' }}
          </span>
        </div>

        <!-- Content grid -->
        <div class="rc-grid">

          <!-- Left: image + type -->
          <div class="rc-left glass-panel">
            <div class="rc-image-wrap">
              <img [src]="previewUrl!" alt="Scanned image">
            </div>
            <div class="scan-type-block">
              <span class="st-label">DETECTED SCAN TYPE</span>
              <div class="st-value">
                <mat-icon>{{ getTypeIcon(scanResult.type) }}</mat-icon>
                {{ scanResult.type }}
              </div>
            </div>
          </div>

          <!-- Right: metrics + metadata -->
          <div class="rc-right">

            <!-- Confidence -->
            <div class="metric-card glass-panel">
              <span class="mc-label">Confidence Score</span>
              <span class="mc-value conf">{{ (scanResult.confidence * 100).toFixed(1) }}%</span>
              <mat-progress-bar mode="determinate" [value]="scanResult.confidence * 100"></mat-progress-bar>
            </div>

            <!-- Processing time -->
            <div class="metric-card glass-panel">
              <span class="mc-label">Processing Time</span>
              <span class="mc-value">{{ scanResult.timeTaken.toFixed(2) }}s</span>
              <span class="mc-sub">Backend ML inference</span>
            </div>

            <!-- Patient + record info -->
            <div class="meta-table glass-panel">
              <div class="meta-row">
                <span class="mk">Patient ID</span>
                <span class="mv">{{ scanResult.patientId || patientId }}</span>
              </div>
              <div class="meta-row">
                <span class="mk">Patient Name</span>
                <span class="mv">{{ scanResult.patientName || patientName }}</span>
              </div>
              <div class="meta-row">
                <span class="mk">Scan Date</span>
                <span class="mv">{{ scanResult.date }}</span>
              </div>
              <div class="meta-row">
                <span class="mk">Record ID</span>
                <span class="mv mono">{{ scanResult.id }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="rc-actions">
              <button mat-flat-button class="btn-primary" routerLink="/dashboard">
                <mat-icon>dashboard</mat-icon> View Dashboard
              </button>
              <button mat-stroked-button class="btn-outline" (click)="startOver()">
                <mat-icon>add_circle_outline</mat-icon> New Scan
              </button>
            </div>
          </div>
        </div>
      </div>

    </main>
  `,
  styleUrl: './upload.scss'
})
export class UploadComponent {
  step: Step = 'patient';

  // Patient form
  patientId   = '';
  patientName = '';

  // File/upload state
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // Result state
  scanResult: ScanResult | null = null;
  errorMessage: string | null = null;
  savedToDatabase = false;

  private readonly BACKEND_URL = backendConfig.baseUrl;
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  constructor(private http: HttpClient) {}

  // ── Navigation ──────────────────────────────────────────────────────────
  goToUpload() {
    if (!this.patientId.trim() || !this.patientName.trim()) return;
    this.step = 'upload';
    this.cdr.detectChanges();
  }

  stepDone(s: Step): boolean {
    const order: Step[] = ['patient', 'upload', 'scanning', 'result'];
    return order.indexOf(this.step) > order.indexOf(s);
  }

  clearFile() {
    this.selectedFile = null;
    this.previewUrl   = null;
    this.cdr.detectChanges();
  }

  startOver() {
    this.step          = 'patient';
    this.patientId     = '';
    this.patientName   = '';
    this.selectedFile  = null;
    this.previewUrl    = null;
    this.scanResult    = null;
    this.errorMessage  = null;
    this.savedToDatabase = false;
    this.cdr.detectChanges();
  }

  retry() {
    this.errorMessage = null;
    this.step = 'scanning';
    this.cdr.detectChanges();
    if (this.selectedFile) this.startScanning();
  }

  // ── File handling ────────────────────────────────────────────────────────
  onFileSelected(file: File) {
    this.selectedFile = file;
    this.errorMessage = null;
    this.scanResult   = null;
    const reader = new FileReader();
    reader.onload = () => { 
      this.previewUrl = reader.result as string; 
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  // ── Upload + scan flow ───────────────────────────────────────────────────
  uploadAndScan() {
    if (!this.selectedFile) return;
    this.errorMessage  = null;
    this.step = 'scanning';
    this.cdr.detectChanges();
    this.startScanning();
  }

  private startScanning() {
    const formData = new FormData();
    formData.append('file',         this.selectedFile!);
    formData.append('patient_id',   this.patientId.trim());
    formData.append('patient_name', this.patientName.trim());

    this.http.post<any>(`${this.BACKEND_URL}/api/classify`, formData).subscribe({
      next: (result) => {
        this.scanResult = {
          type:        this.formatType(result.type || result.scan_type),
          confidence:  result.confidence ?? result.confidence_score ?? 0,
          timeTaken:   result.timeTaken  ?? result.time_taken ?? 0,
          id:          result.id         ?? '',
          date:        result.date       ?? new Date().toISOString().split('T')[0],
          patientId:   result.patientId  || this.patientId,
          patientName: result.patientName || this.patientName,
          status:      result.status     ?? 'Sorted',
          storagePath: result.storagePath ?? '',
          url:         result.url        ?? ''
        };
        this.step = 'result';
        this.savedToDatabase = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.step = 'upload';
        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to the AI backend. Make sure the Flask server is running on port 5001.';
        } else if (err.status === 401) {
          this.errorMessage = 'Authentication error (401). Check that the API key in backend-config.ts matches the backend .env file.';
        } else {
          this.errorMessage = `Backend error (${err.status}): ${err.error?.error || err.message}`;
        }
        this.cdr.detectChanges();
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  formatType(raw: string): string {
    if (!raw) return 'Unknown';
    const map: Record<string, string> = {
      ct: 'CT Scan', 'ct scan': 'CT Scan',
      mri: 'MRI',
      xray: 'X-Ray', 'x-ray': 'X-Ray', x_ray: 'X-Ray',
      ultrasound: 'Ultrasound',
      unknown: 'Unclassified'
    };
    return map[raw.toLowerCase().trim()] ?? raw;
  }

  getTypeIcon(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('ct'))              return 'radio_button_checked';
    if (t.includes('mri'))             return 'grain';
    if (t.includes('x-ray') || t.includes('xray')) return 'emergency';
    if (t.includes('ultrasound'))      return 'waves';
    return 'document_scanner';
  }
}
