import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, MatCardModule, MatIconModule],
  template: `
    <app-navbar></app-navbar>
    <main class="features-page">
      <div class="container">
        <div class="page-header">
          <h1>Powerful AI Features</h1>
          <p>Advanced tools for the modern radiologist</p>
        </div>

        <div class="features-grid">
          <mat-card class="feature-item glass-panel" *ngFor="let f of features">
            <div class="feature-header">
              <div class="icon-box"><mat-icon>{{f.icon}}</mat-icon></div>
              <h2>{{f.title}}</h2>
            </div>
            <p>{{f.desc}}</p>
            <ul class="feature-list">
              <li *ngFor="let point of f.points">
                <mat-icon>check_circle</mat-icon>
                <span>{{point}}</span>
              </li>
            </ul>
          </mat-card>
        </div>
      </div>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .features-page { padding-top: 120px; padding-bottom: 60px; }
    .page-header { text-align: center; margin-bottom: 4rem; }
    .page-header h1 { font-size: 3rem; margin-bottom: 1rem; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; }
    .feature-item { padding: 3rem; }
    .feature-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }
    .icon-box { width: 60px; height: 60px; background: rgba(2, 132, 199, 0.1); border-radius: 15px; display: flex; align-items: center; justify-content: center; color: var(--primary); }
    .icon-box mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .feature-item h2 { font-size: 1.75rem; }
    .feature-item p { color: var(--text-secondary); margin-bottom: 2rem; font-size: 1.1rem; line-height: 1.6; }
    .feature-list { list-style: none; padding: 0; }
    .feature-list li { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; color: var(--text-primary); font-weight: 500; }
    .feature-list li mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--success); }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    @media (max-width: 576px) { .features-grid { grid-template-columns: 1fr; } }
  `]
})
export class FeaturesComponent {
  features = [
    {
      icon: 'auto_awesome',
      title: 'Auto-Classification',
      desc: 'Our neural network automatically detects the type of scan upon upload.',
      points: ['X-Ray detection', 'MRI slice identification', 'CT Scan categorization']
    },
    {
      icon: 'insights',
      title: 'Confidence Scoring',
      desc: 'Every prediction comes with a confidence score and heatmap analysis.',
      points: ['Probabilistic outcomes', 'Heatmap visualization', 'Error threshold alerts', 'Manual override support']
    },
    {
      icon: 'folder_zip',
      title: 'Batch Processing',
      desc: 'Process entire patient folders or hospital archives in one go.',
      points: ['Bulk upload support', 'Zip file extraction', 'Parallel processing', 'Auto-naming conventions']
    },
    {
      icon: 'integration_instructions',
      title: 'API Integration',
      desc: 'Connect MedVisionSort directly to your existing PACS or RIS systems.',
      points: ['RESTful API access', 'Webhooks support', 'DICOM listener', 'Cloud & On-premise sync']
    }
  ];
}
