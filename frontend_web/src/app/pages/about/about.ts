import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, MatCardModule, MatIconModule],
  template: `
    <app-navbar></app-navbar>
    <main class="about-page">
      <div class="container">
        <div class="page-header">
          <h1>About MedVisionSort</h1>
          <p>Revolutionizing medical imaging through Artificial Intelligence</p>
        </div>

        <section class="mission glass-panel">
          <div class="content">
            <h2>Our Mission</h2>
            <p>MedVisionSort was founded with a single goal: to reduce the administrative burden on healthcare professionals by automating the classification and organization of medical imagery. Our AI models are trained on millions of scans to provide enterprise-grade accuracy and speed.</p>
          </div>
        </section>

        <div class="values-grid">
          <mat-card class="value-card glass-panel">
            <mat-icon>verified</mat-icon>
            <h3>Accuracy</h3>
            <p>99.4% precision in detecting X-Ray, MRI, and CT modalities.</p>
          </mat-card>
          <mat-card class="value-card glass-panel">
            <mat-icon>speed</mat-icon>
            <h3>Efficiency</h3>
            <p>Processing scans in under 0.5 seconds, saving hours of manual sorting.</p>
          </mat-card>
          <mat-card class="value-card glass-panel">
            <mat-icon>lock</mat-icon>
            <h3>Security</h3>
            <p>Full HIPAA compliance with end-to-end encryption for all patient data.</p>
          </mat-card>
        </div>
      </div>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .about-page { padding-top: 120px; padding-bottom: 60px; }
    .page-header { text-align: center; margin-bottom: 4rem; }
    .page-header h1 { font-size: 3rem; margin-bottom: 1rem; }
    .mission { padding: 4rem; margin-bottom: 4rem; text-align: center; }
    .mission h2 { margin-bottom: 1.5rem; font-size: 2rem; }
    .mission p { font-size: 1.2rem; color: var(--text-secondary); line-height: 1.8; max-width: 800px; margin: 0 auto; }
    .values-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
    .value-card { text-align: center; padding: 3rem 2rem; transition: transform 0.3s ease; }
    .value-card:hover { transform: translateY(-10px); }
    .value-card mat-icon { font-size: 48px; width: 48px; height: 48px; color: var(--primary); margin-bottom: 1.5rem; }
    .value-card h3 { margin-bottom: 1rem; font-size: 1.5rem; }
    .value-card p { color: var(--text-secondary); line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
  `]
})
export class AboutComponent {}
