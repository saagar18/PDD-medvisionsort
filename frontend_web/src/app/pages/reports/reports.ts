import { Component, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

interface MedicalReport {
  id: string;
  patientName: string;
  patientId: string;
  type: string;
  date: string;
  status: 'Draft' | 'Finalized' | 'Pending Review';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatTableModule, 
    MatButtonModule, 
    MatChipsModule,
    MatPaginatorModule,
    MatDialogModule
  ],
  template: `
    <header class="dashboard-header">
      <div class="header-left">
        <h1>Medical Reports</h1>
        <p>Access and manage generated diagnostic summaries</p>
      </div>
      <div class="header-actions">
        <button mat-flat-button class="btn-primary" (click)="createNewReport()">
          <mat-icon>add</mat-icon>
          Create New Report
        </button>
      </div>
    </header>

    <div class="reports-stats">
      <mat-card class="stat-mini glass-panel">
        <span class="label">Total Reports</span>
        <span class="value">76</span>
      </mat-card>
      <mat-card class="stat-mini glass-panel">
        <span class="label">Pending Review</span>
        <span class="value warning">{{ getPendingCount() }}</span>
      </mat-card>
      <mat-card class="stat-mini glass-panel">
        <span class="label">Drafts</span>
        <span class="value">{{ getDraftsCount() }}</span>
      </mat-card>
    </div>

    <mat-card class="reports-table-card glass-panel">
      <table mat-table [dataSource]="dataSource" class="reports-table">
        <ng-container matColumnDef="sno">
          <th mat-header-cell *matHeaderCellDef> S.NO </th>
          <td mat-cell *matCellDef="let element; let i = index"> {{i + 1 + (paginator ? paginator.pageIndex * paginator.pageSize : 0)}} </td>
        </ng-container>

        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef> REPORT ID </th>
          <td mat-cell *matCellDef="let element"> {{element.id}} </td>
        </ng-container>

        <ng-container matColumnDef="patient">
          <th mat-header-cell *matHeaderCellDef> PATIENT </th>
          <td mat-cell *matCellDef="let element">
            <div class="patient-cell">
              <span class="name">{{element.patientName}}</span>
              <span class="id">{{element.patientId}}</span>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef> TYPE </th>
          <td mat-cell *matCellDef="let element"> {{element.type}} </td>
        </ng-container>

        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef> GENERATED DATE </th>
          <td mat-cell *matCellDef="let element"> {{element.date}} </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef> STATUS </th>
          <td mat-cell *matCellDef="let element">
            <span class="status-badge" [class]="element.status.toLowerCase().replace(' ', '-')">
              {{element.status}}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> </th>
          <td mat-cell *matCellDef="let element">
            <div class="action-btns">
              <button mat-icon-button color="primary" matTooltip="Download Report" (click)="downloadReport(element)">
                <mat-icon>download</mat-icon>
              </button>
              <button mat-icon-button color="primary" matTooltip="Edit Status" (click)="editReport(element)">
                <mat-icon>edit</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <!-- MatPaginator for table pagination (10 items per page) -->
      <mat-paginator [pageSizeOptions]="[10, 25, 50]"
                     pageSize="10"
                     showFirstLastButtons
                     class="glass-paginator">
      </mat-paginator>
    </mat-card>

    <!-- Success Notification Toast -->
    <div class="toast-notification" *ngIf="showToast">
      <mat-icon>check_circle</mat-icon>
      <span>{{ toastMessage }}</span>
    </div>
  `,
  styles: [`
    .dashboard-header { margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-end; }
    .reports-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-mini { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .stat-mini .label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-mini .value { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
    .stat-mini .value.warning { color: var(--warning); }
    
    .reports-table-card { padding: 1rem; border-radius: 16px; overflow: hidden; }
    .reports-table { width: 100%; background: transparent !important; }
    .reports-table th { color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 1px; border-bottom: 1px solid var(--bg-tertiary); padding: 1rem 0.5rem; }
    .reports-table td { padding: 1.25rem 0.5rem; border-bottom: 1px solid var(--bg-tertiary); color: var(--text-secondary); font-size: 0.85rem; }
    
    .patient-cell { display: flex; flex-direction: column; }
    .patient-cell .name { font-weight: 700; color: var(--text-primary); }
    .patient-cell .id { font-size: 0.75rem; color: var(--text-muted); }
    .status-badge { padding: 0.35rem 0.75rem; border-radius: 99px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; width: fit-content; display: inline-block; text-align: center; }
    .status-badge.finalized { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    .status-badge.pending-review { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
    .status-badge.draft { background: rgba(148, 163, 184, 0.1); color: var(--text-muted); }
    .action-btns { display: flex; gap: 0.5rem; }

    /* Custom Glass Paginator Styling */
    .glass-paginator {
      background: transparent !important;
      color: var(--text-primary) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      margin-top: 1rem;
      border-radius: 0 0 16px 16px;
    }
    ::ng-deep .mat-mdc-paginator-range-label,
    ::ng-deep .mat-mdc-paginator-page-size-label {
      color: var(--text-muted) !important;
    }
    ::ng-deep .mat-mdc-icon-button[disabled] {
      color: rgba(255,255,255,0.15) !important;
    }
    ::ng-deep .mat-mdc-icon-button {
      color: var(--text-primary) !important;
    }
    ::ng-deep .mat-mdc-select-value {
      color: var(--text-primary) !important;
    }
    ::ng-deep .mat-mdc-select-arrow {
      color: var(--text-muted) !important;
    }

    .toast-notification { position: fixed; bottom: 2rem; right: 2rem; background: var(--success); color: white; padding: 1rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 0.75rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 1000; font-weight: 600; }
    
    @keyframes slideIn {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @media (max-width: 968px) { .reports-stats { grid-template-columns: 1fr; } }

    /* Custom Glassmorphic Dialog Styling */
    ::ng-deep .custom-dialog-container {
      .mat-mdc-dialog-surface {
        background: rgba(23, 23, 37, 0.95) !important;
        backdrop-filter: blur(25px) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6) !important;
        border-radius: 16px !important;
        padding: 1.5rem !important;
      }
      .mat-mdc-dialog-container {
        padding: 0 !important;
      }
      .mat-mdc-dialog-title {
        color: var(--text-primary) !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 1.4rem !important;
        font-weight: 800 !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
        padding-bottom: 1rem !important;
        margin-bottom: 1rem !important;
      }
      .mat-mdc-dialog-content {
        color: var(--text-secondary) !important;
        font-size: 0.95rem !important;
        line-height: 1.6 !important;
        padding: 0 !important;
        overflow: visible !important;
      }
      .mat-mdc-dialog-actions {
        padding: 1rem 0 0 0 !important;
        border-top: none !important;
      }
      
      /* Material Form Field Overrides inside Dialog */
      .mat-mdc-form-field {
        width: 100%;
        margin-top: 0.5rem;
      }
      .mat-mdc-select-value-text {
        color: var(--text-primary) !important;
        font-weight: 600;
      }
      .mat-mdc-text-field-wrapper {
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 8px !important;
      }
      .mdc-notched-outline {
        display: none !important;
      }
    }
  `]
})
export class ReportsComponent implements AfterViewInit {
  displayedColumns: string[] = ['sno', 'id', 'patient', 'type', 'date', 'status', 'actions'];
  dataSource = new MatTableDataSource<MedicalReport>([]);

  showToast = false;
  toastMessage = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) {
    this.generateReports();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
  }

  getPendingCount(): number {
    return this.dataSource.data.filter(r => r.status === 'Pending Review').length;
  }

  getDraftsCount(): number {
    return this.dataSource.data.filter(r => r.status === 'Draft').length;
  }

  downloadReport(report: MedicalReport) {
    const docContent = `==================================================
MEDVISIONSORT - CLINICAL DIAGNOSTIC REPORT
==================================================
Report ID:        ${report.id}
Generated Date:   ${report.date}
Status:           ${report.status}
--------------------------------------------------
PATIENT DETAILS:
Patient ID:       ${report.patientId}
Patient Name:     ${report.patientName}
--------------------------------------------------
AI ANALYSIS SUMMARY:
Scan Modality:    ${report.type}
Classification:   Verified
Confidence:       99.4%
Verification:     Authorized by Dr. Saagar
==================================================`;
    
    const blob = new Blob([docContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.id}_Report_${report.patientName.replace(' ', '_')}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.toastMessage = `Downloaded report for ${report.patientName}!`;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  editReport(report: MedicalReport) {
    const dialogRef = this.dialog.open(ReportEditDialog, {
      data: report,
      width: '400px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(newStatus => {
      if (newStatus) {
        report.status = newStatus;
        this.toastMessage = `Updated report ${report.id} to ${newStatus}!`;
        this.showToast = true;
        setTimeout(() => this.showToast = false, 3000);
      }
    });
  }

  createNewReport() {
    this.toastMessage = 'Creating new diagnostic report...';
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  generateReports() {
    const patientPool = [
      { name: 'John Doe', id: 'PID-1029' },
      { name: 'Jane Smith', id: 'PID-8821' },
      { name: 'Mike Johnson', id: 'PID-4492' },
      { name: 'Sarah Williams', id: 'PID-2291' },
      { name: 'Robert Brown', id: 'PID-1102' },
      { name: 'Aarav Sharma', id: 'PID-7452' },
      { name: 'Priya Patel', id: 'PID-6298' },
      { name: 'Rajesh Kumar', id: 'PID-4521' },
      { name: 'Anjali Mehta', id: 'PID-3304' },
      { name: 'Sanjay Gupta', id: 'PID-8932' },
      { name: 'Sunita Rao', id: 'PID-7215' },
      { name: 'Vikram Singh', id: 'PID-6671' },
      { name: 'Aditi Joshi', id: 'PID-5091' },
      { name: 'Devendra Verma', id: 'PID-1402' },
      { name: 'Neha Sharma', id: 'PID-2245' },
      { name: 'Rohan Das', id: 'PID-9042' },
      { name: 'Kiran Nair', id: 'PID-1104' },
      { name: 'Amit Mishra', id: 'PID-4491' },
      { name: 'Pooja Reddy', id: 'PID-3367' },
      { name: 'Rahul Saxena', id: 'PID-8910' },
      { name: 'Vijay Yadav', id: 'PID-4105' },
      { name: 'Nisha Sen', id: 'PID-1982' },
      { name: 'Harish Pillai', id: 'PID-8722' },
      { name: 'Meera Nair', id: 'PID-9102' },
      { name: 'Deepak Chawla', id: 'PID-2394' },
      { name: 'Ritu Kapoor', id: 'PID-1029' }
    ];

    const scanTypes = ['Chest X-Ray Analysis', 'Brain MRI Scan', 'Abdominal CT Scan', 'Pelvic X-Ray Analysis', 'Knee MRI Analysis'];
    let reportIdNum = 1;
    const reportsList: MedicalReport[] = [];

    // 1. Generate 12 Pending Review
    for (let i = 0; i < 12; i++) {
      const patient = patientPool[i % patientPool.length];
      const scanType = scanTypes[i % scanTypes.length];
      const date = `2026-05-${String(30 - (i % 15)).padStart(2, '0')}`;
      reportsList.push({
        id: `REP-2026-${String(reportIdNum++).padStart(3, '0')}`,
        patientName: patient.name,
        patientId: patient.id,
        type: scanType,
        date: date,
        status: 'Pending Review'
      });
    }

    // 2. Generate 4 Drafts
    for (let i = 0; i < 4; i++) {
      const patient = patientPool[(i + 12) % patientPool.length];
      const scanType = scanTypes[(i + 2) % scanTypes.length];
      const date = `2026-05-${String(15 - (i % 10)).padStart(2, '0')}`;
      reportsList.push({
        id: `REP-2026-${String(reportIdNum++).padStart(3, '0')}`,
        patientName: patient.name,
        patientId: patient.id,
        type: scanType,
        date: date,
        status: 'Draft'
      });
    }

    // 3. Generate 60 Finalized
    for (let i = 0; i < 60; i++) {
      const patient = patientPool[(i + 16) % patientPool.length];
      const scanType = scanTypes[(i + 1) % scanTypes.length];
      const date = `2026-05-${String(28 - (i % 25)).padStart(2, '0')}`;
      reportsList.push({
        id: `REP-2026-${String(reportIdNum++).padStart(3, '0')}`,
        patientName: patient.name,
        patientId: patient.id,
        type: scanType,
        date: date,
        status: 'Finalized'
      });
    }

    this.dataSource.data = reportsList;
  }
}

/* Standalone Dialog Component for Editing Status */
@Component({
  selector: 'app-report-edit-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule, FormsModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Edit Report Status</h2>
    <mat-dialog-content>
      <div class="dialog-info-banner">
        Updating details for <strong>{{data.id}}</strong><br>
        Patient: <strong>{{data.patientName}}</strong> (ID: {{data.patientId}})
      </div>
      
      <mat-form-field appearance="outline">
        <mat-label>Report Status</mat-label>
        <mat-select [(ngModel)]="selectedStatus">
          <mat-option value="Finalized">Finalized</mat-option>
          <mat-option value="Pending Review">Pending Review</mat-option>
          <mat-option value="Draft">Draft</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close class="btn-dialog-cancel">Cancel</button>
      <button mat-flat-button [mat-dialog-close]="selectedStatus" class="btn-dialog-save">Save Changes</button>
    </mat-dialog-actions>
  `
})
export class ReportEditDialog {
  selectedStatus: 'Draft' | 'Finalized' | 'Pending Review';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MedicalReport
  ) {
    this.selectedStatus = data.status;
  }
}
