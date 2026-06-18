import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MedicalImage } from '../../services/medical-api.service';

@Component({
  selector: 'app-image-viewer-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <div class="viewer-container">
      <div class="viewer-header">
        <div class="title">
          <h2>{{data.type}} Scan</h2>
          <p>{{data.patientName}} ({{data.patientId}})</p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="image-viewport">
        <img [src]="data.url" alt="Medical Scan">
      </div>
      <div class="viewer-footer">
        <div class="info-item">
          <label>Confidence</label>
          <span>{{(data.confidence * 100).toFixed(1)}}%</span>
        </div>
        <div class="info-item">
          <label>Date</label>
          <span>{{data.date}}</span>
        </div>
        <div class="actions">
          <button mat-flat-button color="primary" (click)="dialogRef.close()">Done</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .viewer-container {
      background: var(--bg-secondary);
      border-radius: 16px;
      overflow: hidden;
      max-width: 90vw;
    }
    .viewer-header {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-tertiary);
      
      h2 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
      p { margin: 0; font-size: 0.85rem; color: var(--text-muted); }
    }
    .image-viewport {
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      max-height: 70vh;
      
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        box-shadow: 0 0 40px rgba(0,0,0,0.5);
      }
    }
    .viewer-footer {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .info-item {
        label { display: block; font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem; }
        span { font-weight: 700; color: var(--primary); font-size: 1.1rem; }
      }
    }
  `]
})
export class ImageViewerDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ImageViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MedicalImage
  ) {}
}
