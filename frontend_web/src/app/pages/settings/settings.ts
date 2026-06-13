import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatTabsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatSlideToggleModule,
    MatSelectModule
  ],
  template: `
    <header class="dashboard-header">
      <div class="header-left">
        <h1>General Settings</h1>
        <p>Configure your workspace and system preferences</p>
      </div>
    </header>

    <mat-card class="settings-card glass-panel">
      <mat-tab-group animationDuration="0ms">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>person</mat-icon>
            Profile
          </ng-template>
          <div class="tab-content">
            <h3>Account Information</h3>
            <div class="settings-grid">
              <mat-form-field appearance="outline">
                <mat-label>Display Name</mat-label>
                <input matInput value="Dr. Saagar">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Specialization</mat-label>
                <input matInput value="Senior Radiologist">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email Address</mat-label>
                <input matInput value="dr.saagar@medvisionsort.com" disabled>
              </mat-form-field>
            </div>
            <button mat-flat-button class="btn-primary">Update Profile</button>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>psychology</mat-icon>
            AI Preferences
          </ng-template>
          <div class="tab-content">
            <h3>AI Diagnosis Configuration</h3>
            <div class="toggle-list">
              <div class="toggle-item">
                <div class="info">
                  <span class="label">Auto-Classification</span>
                  <span class="desc">Automatically sort images upon upload</span>
                </div>
                <mat-slide-toggle checked></mat-slide-toggle>
              </div>
              <div class="toggle-item">
                <div class="info">
                  <span class="label">High Confidence Filter</span>
                  <span class="desc">Flag results below 90% confidence for manual review</span>
                </div>
                <mat-slide-toggle checked></mat-slide-toggle>
              </div>
              <div class="toggle-item">
                <div class="info">
                  <span class="label">DICOM Metadata Extraction</span>
                  <span class="desc">Parse patient info directly from scan metadata</span>
                </div>
                <mat-slide-toggle checked></mat-slide-toggle>
              </div>
            </div>
            
            <mat-form-field appearance="outline" class="select-field">
              <mat-label>AI Model Version</mat-label>
              <mat-select value="v2.4-stable">
                <mat-option value="v2.4-stable">v2.4 Stable (Latest)</mat-option>
                <mat-option value="v2.5-beta">v2.5 Beta (Experimental)</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>security</mat-icon>
            Security
          </ng-template>
          <div class="tab-content">
            <h3>Security & Privacy</h3>
            <div class="settings-grid single">
              <mat-form-field appearance="outline">
                <mat-label>Current Password</mat-label>
                <input matInput type="password">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>New Password</mat-label>
                <input matInput type="password">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Confirm New Password</mat-label>
                <input matInput type="password">
              </mat-form-field>
            </div>
            <button mat-flat-button color="warn">Change Password</button>
            <div class="security-info">
              <mat-icon>verified_user</mat-icon>
              <p>Two-factor authentication is currently <strong>enabled</strong>.</p>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-card>
  `,
  styles: [`
    .dashboard-header { margin-bottom: 2.5rem; }
    .settings-card { padding: 0; overflow: hidden; }
    .tab-content { padding: 2.5rem; }
    h3 { margin-bottom: 2rem; font-size: 1.25rem; }
    
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;
      &.single { grid-template-columns: 1fr; max-width: 400px; }
    }
    
    .toggle-list { display: flex; flex-direction: column; gap: 2rem; margin-bottom: 2.5rem; }
    .toggle-item { display: flex; justify-content: space-between; align-items: center; 
      .info { display: flex; flex-direction: column; 
        .label { font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem; }
        .desc { font-size: 0.85rem; color: var(--text-muted); }
      }
    }
    
    .select-field { width: 100%; max-width: 400px; }
    
    .security-info { display: flex; align-items: center; gap: 1rem; margin-top: 2.5rem; padding: 1.5rem; background: var(--bg-tertiary); border-radius: 12px; color: var(--text-secondary);
      mat-icon { color: var(--success); }
    }
    
    ::ng-deep .mat-mdc-tab-header { background: var(--bg-tertiary); }
    ::ng-deep .mat-mdc-tab-label-container { padding: 0 1rem; }
    ::ng-deep .mat-mdc-tab .mdc-tab__text-label { display: flex; align-items: center; gap: 0.75rem; font-weight: 600; }
  `]
})
export class SettingsComponent {}
