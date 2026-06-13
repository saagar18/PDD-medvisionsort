import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule, BaseChartDirective],
  template: `
    <header class="dashboard-header">
      <div class="header-left">
        <h1>Detailed Statistics</h1>
        <p>Distribution analysis across scan modalities</p>
      </div>
    </header>

    <div class="stats-container">
      <mat-card class="chart-card glass-panel">
        <div class="card-header">
          <h3>Scan Modality Distribution</h3>
          <mat-icon matTooltip="Percentage breakdown of all processed medical images">info</mat-icon>
        </div>
        <div class="chart-wrapper">
          <canvas baseChart
            [data]="pieChartData"
            [options]="pieChartOptions"
            [type]="pieChartType">
          </canvas>
        </div>
        <div class="chart-legend">
          <div class="legend-item" *ngFor="let label of chartLabels; let i = index">
            <span class="dot" [style.background-color]="chartColors[i]"></span>
            <span class="label">{{label}}</span>
            <span class="val">{{chartData[i]}}%</span>
          </div>
        </div>
      </mat-card>

      <div class="stats-info-grid">
        <mat-card class="info-card glass-panel primary">
          <mat-icon>trending_up</mat-icon>
          <div class="details">
            <span class="label">Most Active</span>
            <span class="value">X-Ray Scans</span>
          </div>
        </mat-card>
        <mat-card class="info-card glass-panel accent">
          <mat-icon>update</mat-icon>
          <div class="details">
            <span class="label">Last Updated</span>
            <span class="value">Just now</span>
          </div>
        </mat-card>
        <mat-card class="info-card glass-panel success">
          <mat-icon>verified</mat-icon>
          <div class="details">
            <span class="label">Data Accuracy</span>
            <span class="value">99.8%</span>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header { margin-bottom: 2.5rem; }
    .stats-container { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; }
    
    .chart-card { padding: 2rem; display: flex; flex-direction: column; align-items: center; }
    .card-header { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
      h3 { margin: 0; font-size: 1.25rem; }
      mat-icon { color: var(--text-muted); cursor: pointer; }
    }
    
    .chart-wrapper { width: 100%; max-width: 400px; height: 400px; margin-bottom: 2rem; position: relative; }
    
    .chart-legend { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-top: 1px solid var(--bg-tertiary); padding-top: 2rem; }
    .legend-item { display: flex; align-items: center; gap: 0.75rem; 
      .dot { width: 12px; height: 12px; border-radius: 3px; }
      .label { font-size: 0.9rem; color: var(--text-secondary); flex: 1; }
      .val { font-weight: 700; color: var(--text-primary); }
    }

    .stats-info-grid { display: flex; flex-direction: column; gap: 1.5rem; }
    .info-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; 
      mat-icon { font-size: 32px; width: 32px; height: 32px; }
      .details { display: flex; flex-direction: column; 
        .label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .value { font-weight: 700; font-size: 1.1rem; }
      }
      &.primary mat-icon { color: var(--primary); }
      &.accent mat-icon { color: var(--accent); }
      &.success mat-icon { color: var(--success); }
    }

    @media (max-width: 968px) { .stats-container { grid-template-columns: 1fr; } }
  `]
})
export class StatisticsComponent implements OnInit {
  public pieChartType: ChartType = 'pie';
  
  public chartLabels = ['X-Ray', 'MRI', 'CT Scan'];
  public chartData = [45, 30, 25];
  public chartColors = ['#0284c7', '#8b5cf6', '#06b6d4'];

  public pieChartData: ChartData<'pie', number[], string> = {
    labels: this.chartLabels,
    datasets: [
      {
        data: this.chartData,
        backgroundColor: this.chartColors,
        hoverBackgroundColor: ['#0369a1', '#7c3aed', '#0891b2'],
        hoverBorderColor: ['#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value}%`;
          }
        }
      }
    },
  };

  constructor() {}
  ngOnInit() {}
}
