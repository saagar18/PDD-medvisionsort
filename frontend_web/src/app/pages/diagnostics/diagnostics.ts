import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-diagnostics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <header class="dashboard-header">
      <div class="header-left">
        <h1>AI Diagnostics & Analytics</h1>
        <p>Performance metrics and system health indicators</p>
      </div>
    </header>

    <div class="diagnostics-grid">
      <mat-card class="metric-card glass-panel">
        <div class="metric-header">
          <mat-icon>psychology</mat-icon>
          <h3>Model Accuracy</h3>
        </div>
        <div class="metric-value">99.4%</div>
        <mat-progress-bar mode="determinate" value="99.4"></mat-progress-bar>
        <p class="trend positive"><mat-icon>trending_up</mat-icon> +0.2% from last month</p>
      </mat-card>

      <mat-card class="metric-card glass-panel">
        <div class="metric-header">
          <mat-icon>speed</mat-icon>
          <h3>Processing Speed</h3>
        </div>
        <div class="metric-value">1.2s</div>
        <mat-progress-bar mode="determinate" value="85"></mat-progress-bar>
        <p class="trend positive"><mat-icon>trending_down</mat-icon> -150ms improvement</p>
      </mat-card>

      <mat-card class="metric-card glass-panel">
        <div class="metric-header">
          <mat-icon>storage</mat-icon>
          <h3>Data Volume</h3>
        </div>
        <div class="metric-value">1.6 GB</div>
        <mat-progress-bar mode="determinate" value="45"></mat-progress-bar>
        <p class="trend">45% of storage capacity used</p>
      </mat-card>
    </div>

    <div class="analysis-sections">
      <mat-card class="chart-section glass-panel">
        <h3>Modality Distribution</h3>
        <div class="distribution-list">
          <div class="dist-item">
            <span class="label">X-Ray</span>
            <div class="bar-wrapper">
              <div class="bar" style="width: 45%; background: #3b82f6;"></div>
            </div>
            <span class="pct">45%</span>
          </div>
          <div class="dist-item">
            <span class="label">MRI</span>
            <div class="bar-wrapper">
              <div class="bar" style="width: 30%; background: #8b5cf6;"></div>
            </div>
            <span class="pct">30%</span>
          </div>
          <div class="dist-item">
            <span class="label">CT Scan</span>
            <div class="bar-wrapper">
              <div class="bar" style="width: 25%; background: #06b6d4;"></div>
            </div>
            <span class="pct">25%</span>
          </div>
        </div>
      </mat-card>

      <mat-card class="status-section glass-panel">
        <h3>System Diagnostics</h3>
        <div class="status-list">
          <div class="status-item online">
            <mat-icon>check_circle</mat-icon>
            <div class="info">
              <span class="name">AI Inference Engine</span>
              <span class="desc">Running optimally (v2.4.1)</span>
            </div>
          </div>
          <div class="status-item online">
            <mat-icon>check_circle</mat-icon>
            <div class="info">
              <span class="name">Storage Node Alpha</span>
              <span class="desc">Healthy - 12ms latency</span>
            </div>
          </div>
          <div class="status-item warning">
            <mat-icon>error</mat-icon>
            <div class="info">
              <span class="name">Backup Service</span>
              <span class="desc">Partial sync - scheduled retry</span>
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-header { margin-bottom: 2.5rem; }
    .diagnostics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem; }
    .metric-card { padding: 2rem; }
    .metric-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; color: var(--text-muted); }
    .metric-header mat-icon { color: var(--primary); }
    .metric-header h3 { margin: 0; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .metric-value { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; color: var(--text-primary); }
    .trend { font-size: 0.85rem; margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); }
    .trend.positive { color: var(--success); }
    .trend mat-icon { font-size: 16px; width: 16px; height: 16px; }
    
    .analysis-sections { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; }
    .chart-section, .status-section { padding: 2rem; }
    .chart-section h3, .status-section h3 { margin-bottom: 2rem; }
    
    .distribution-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .dist-item { display: flex; align-items: center; gap: 1rem; }
    .dist-item .label { width: 80px; font-weight: 600; font-size: 0.9rem; }
    .dist-item .bar-wrapper { flex: 1; height: 12px; background: var(--bg-tertiary); border-radius: 6px; overflow: hidden; }
    .dist-item .bar { height: 100%; border-radius: 6px; }
    .dist-item .pct { width: 40px; text-align: right; font-weight: 700; font-size: 0.9rem; color: var(--text-primary); }
    
    .status-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .status-item { display: flex; align-items: flex-start; gap: 1rem; }
    .status-item mat-icon { margin-top: 2px; }
    .status-item.online mat-icon { color: var(--success); }
    .status-item.warning mat-icon { color: var(--warning); }
    .status-item .name { display: block; font-weight: 700; font-size: 1rem; }
    .status-item .desc { display: block; font-size: 0.85rem; color: var(--text-muted); }
    
    @media (max-width: 1100px) { .analysis-sections { grid-template-columns: 1fr; } }
  `]
})
export class DiagnosticsComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
