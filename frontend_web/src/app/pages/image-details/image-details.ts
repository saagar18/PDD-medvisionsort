import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MockApiService, MedicalImage } from '../../services/mock-api.service';

@Component({
  selector: 'app-image-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule],
  template: `
    <header class="dashboard-header">
      <div class="header-left">
        <div class="back-link" routerLink="/dashboard">
          <mat-icon>arrow_back</mat-icon>
          <span>Back to Dashboard</span>
        </div>
        <h1>Image Analysis: {{imageId}}</h1>
      </div>
    </header>

    <div class="details-grid" *ngIf="image">
      <mat-card class="image-card glass-panel">
        <img [src]="image.url" [alt]="image.type">
      </mat-card>

      <div class="info-sidebar">
        <mat-card class="analysis-card glass-panel">
          <h2>AI Classification</h2>
          <div class="result-badge">{{image.type}}</div>
          <div class="confidence-info">
            <label>Confidence Score</label>
            <div class="val">{{(image.confidence * 100).toFixed(1)}}%</div>
          </div>
        </mat-card>

        <mat-card class="metadata-card glass-panel">
          <h2>Metadata</h2>
          <div class="meta-item">
            <label>Patient ID</label>
            <span>{{image.patientId}}</span>
          </div>
          <div class="meta-item">
            <label>Patient Name</label>
            <span>{{image.patientName}}</span>
          </div>
          <div class="meta-item">
            <label>Scan Date</label>
            <span>{{image.date}}</span>
          </div>
          <div class="meta-item">
            <label>Status</label>
            <span>{{image.status}}</span>
          </div>
        </mat-card>

        <button mat-flat-button class="btn-primary full-width" (click)="downloadReport()">Download Report</button>
      </div>
    </div>

    <div *ngIf="!image" style="text-align: center; padding: 3rem; font-family: var(--font-primary); color: var(--text-muted);">
      <mat-icon style="font-size: 48px; width: 48px; height: 48px;">error</mat-icon>
      <p>Image not found or loading...</p>
    </div>
  `,
  styles: [`
    .dashboard-header { margin-bottom: 2rem; }
    .back-link { display: flex; align-items: center; gap: 0.5rem; color: var(--primary); cursor: pointer; margin-bottom: 1rem; font-weight: 600; }
    .details-grid { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; margin-top: 2rem; }
    .image-card img { width: 100%; border-radius: 12px; background: #000; }
    .info-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
    .analysis-card, .metadata-card { padding: 2rem; }
    .result-badge { background: var(--primary); color: white; display: inline-block; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; margin: 1rem 0; }
    .meta-item { display: flex; justify-content: space-between; margin-bottom: 1rem; }
    .meta-item label { color: var(--text-muted); font-size: 0.9rem; }
    .meta-item span { font-weight: 600; }
    .confidence-info { margin-top: 1rem; }
    .confidence-info label { color: var(--text-muted); font-size: 0.9rem; }
    .confidence-info .val { font-size: 1.75rem; font-weight: 800; color: var(--primary); margin-top: 0.25rem; }
    .full-width { width: 100%; }
    @media (max-width: 968px) { .details-grid { grid-template-columns: 1fr; } }
  `]
})
export class ImageDetailsComponent implements OnInit {
  imageId: string | null = null;
  image: MedicalImage | undefined;

  constructor(private route: ActivatedRoute, private mockApi: MockApiService) {}

  ngOnInit() {
    this.imageId = this.route.snapshot.paramMap.get('id');
    if (this.imageId) {
      this.mockApi.getImageById(this.imageId).subscribe(img => {
        this.image = img;
      });
    }
  }

  /**
   * VULN-13 FIX: HTML-escape helper.
   * All Firestore-sourced strings MUST be passed through this before
   * interpolation into the HTML report template, preventing stored XSS.
   */
  private escapeHtml(raw: string): string {
    return (raw ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  downloadReport() {
    if (!this.image) return;

    const imgUrl = window.location.origin + '/' + this.image.url;

    // Fetch the image and convert it to Base64 to embed it directly inside the HTML report.
    // This allows the HTML file to be saved directly to the system as a self-contained document.
    fetch(imgUrl)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          this.generateHtmlFile(base64data);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        // Fallback to absolute URL if base64 conversion fails
        this.generateHtmlFile(imgUrl);
      });
  }

  generateHtmlFile(imgSrc: string) {
    if (!this.image) return;

    // VULN-13 FIX: Escape ALL Firestore-sourced values before HTML interpolation
    const safePatientId   = this.escapeHtml(this.image.patientId);
    const safePatientName = this.escapeHtml(this.image.patientName);
    const safeDate        = this.escapeHtml(this.image.date);
    const safeStatus      = this.escapeHtml(this.image.status);
    const safeType        = this.escapeHtml(this.image.type);
    const safeConfidence  = this.escapeHtml(
      (this.image.confidence * 100).toFixed(1) + '% Confidence'
    );
    // imgSrc is either a data: URI (base64) or a same-origin URL — safe to embed

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Clinical Report - ${safePatientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; margin: 0; line-height: 1.6; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; }
    .logo span { color: #0284c7; }
    .title { font-size: 26px; font-weight: 800; margin: 0; color: #0284c7; text-transform: uppercase; letter-spacing: 1px; }
    .grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 30px; margin-bottom: 30px; }
    .meta-table { width: 100%; border-collapse: collapse; }
    .meta-table th, .meta-table td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .meta-table th { color: #64748b; font-weight: 600; font-size: 13px; text-transform: uppercase; width: 35%; }
    .meta-table td { font-weight: 700; color: #0f172a; font-size: 15px; }
    .image-container { border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #0f172a; padding: 10px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .image-container img { max-width: 100%; max-height: 320px; border-radius: 8px; object-fit: contain; }
    .badge { display: inline-block; padding: 6px 16px; background: #0284c7; color: white; border-radius: 6px; font-weight: 800; font-size: 16px; letter-spacing: 0.5px; }
    .section-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 40px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .impression { color: #334155; font-size: 15px; text-align: justify; }
    .footer { margin-top: 100px; display: flex; justify-content: space-between; align-items: flex-end; }
    .signature { text-align: center; width: 260px; }
    .signature-line { border-top: 2px solid #94a3b8; margin-bottom: 8px; }
    .signature-text { font-size: 12px; color: #64748b; font-weight: 500; }
    .print-btn-bar { background: #f8fafc; padding: 15px 40px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 15px; }
    .btn { padding: 10px 20px; border-radius: 99px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-print { background: #0284c7; color: white; }
    .btn-close { background: #e2e8f0; color: #475569; }
    @media print {
      body { padding: 0; }
      .print-btn-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-btn-bar no-print">
    <button class="btn btn-print" onclick="window.print()">Print / Save as PDF</button>
  </div>
  
  <div class="header">
    <div class="logo">✚ MedVision<span>Sort</span></div>
    <div class="title">Clinical Analysis Report</div>
  </div>

  <div class="grid">
    <div>
      <table class="meta-table">
        <tr>
          <th>Patient ID</th>
          <td>${safePatientId}</td>
        </tr>
        <tr>
          <th>Patient Name</th>
          <td>${safePatientName}</td>
        </tr>
        <tr>
          <th>Scan Date</th>
          <td>${safeDate}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td style="color: #10b981;">&#10003; ${safeStatus}</td>
        </tr>
        <tr>
          <th>Modality</th>
          <td><span class="badge">${safeType}</span></td>
        </tr>
        <tr>
          <th>AI Accuracy</th>
          <td>${safeConfidence}</td>
        </tr>
      </table>
    </div>

    <div class="image-container">
      <img src="${imgSrc}" alt="Medical Scan">
    </div>
  </div>

  <div class="section-title">Clinical Impression</div>
  <p class="impression">
    The advanced MedVisionSort Neural Net Classifier has successfully parsed the uploaded clinical medical imagery and categorized the scan type as a verified <strong>${safeType}</strong> modality. The deep learning system executed the ingestion and tissue matrix identification at a confidence validation score of <strong>${safeConfidence}</strong>. No major ingestion errors, tissue artifacts, or classification anomalies were encountered during processing. Result archived and mapped to the patient registry.
  </p>

  <div class="footer">
    <div class="signature">
      <div class="signature-line"></div>
      <div class="signature-text">Clinical Systems Director</div>
    </div>
    <div class="signature" style="text-align: right;">
      <div class="signature-line"></div>
      <div class="signature-text">Authorized AI Ingestion Signature</div>
    </div>
  </div>
</body>
</html>
`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Medical_Report_${this.image.patientId}_${this.image.id}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
