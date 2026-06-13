import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    MatDividerModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <header class="dashboard-header">
      <h1>User Profile</h1>
      <p>Manage your account settings and preferences</p>
    </header>

    <div class="profile-grid">
      <mat-card class="profile-main glass-panel">
        <!-- READING VIEW -->
        <ng-container *ngIf="!isEditing">
          <div class="profile-header">
            <div class="avatar">{{ getInitials() }}</div>
            <div class="info">
              <h2>{{ profile.name }}</h2>
              <p>{{ profile.role }}</p>
            </div>
            <button mat-flat-button color="primary" class="edit-btn" (click)="startEdit()">
              <mat-icon>edit</mat-icon> Edit Profile
            </button>
          </div>
          <mat-divider></mat-divider>
          <div class="profile-details">
            <div class="detail-item">
              <label>Email</label>
              <span>{{ profile.email }}</span>
            </div>
            <div class="detail-item">
              <label>Organization</label>
              <span>{{ profile.organization }}</span>
            </div>
            <div class="detail-item">
              <label>Member Since</label>
              <span>{{ profile.memberSince }}</span>
            </div>
          </div>
        </ng-container>

        <!-- EDITING VIEW -->
        <ng-container *ngIf="isEditing">
          <div class="profile-header editing">
            <div class="avatar-edit-container">
              <div class="avatar">{{ getInitials() }}</div>
              <div class="avatar-overlay"><mat-icon>photo_camera</mat-icon></div>
            </div>
            <div class="info">
              <h2>Edit Account Details</h2>
              <p>Update your personal information below</p>
            </div>
          </div>
          <mat-divider></mat-divider>
          
          <form class="edit-form" (ngSubmit)="saveChanges()">
            <div class="form-grid">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Full Name</mat-label>
                <input matInput [(ngModel)]="editName" name="name" required placeholder="Dr. Saagar">
                <mat-icon matSuffix>person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Title / Role</mat-label>
                <input matInput [(ngModel)]="editRole" name="role" required placeholder="Senior Radiologist">
                <mat-icon matSuffix>badge</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email Address</mat-label>
                <input matInput type="email" [(ngModel)]="editEmail" name="email" required placeholder="dr.saagar@medvisionsort.com">
                <mat-icon matSuffix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Organization</mat-label>
                <input matInput [(ngModel)]="editOrganization" name="organization" required placeholder="Central Diagnostic Center">
                <mat-icon matSuffix>business</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" class="cancel-btn" (click)="cancelEdit()">Cancel</button>
              <button mat-flat-button color="primary" type="submit" class="save-btn">
                <mat-icon>check</mat-icon> Save Changes
              </button>
            </div>
          </form>
        </ng-container>
      </mat-card>

      <mat-card class="profile-stats glass-panel">
        <h3>Activity Summary</h3>
        <div class="stat-row">
          <span class="label">Total Scans</span>
          <span class="val">85</span>
        </div>
        <div class="stat-row">
          <span class="label">Accuracy Rate</span>
          <span class="val">99.4%</span>
        </div>
        <div class="stat-row">
          <span class="label">Reports Generated</span>
          <span class="val">76</span>
        </div>
      </mat-card>
    </div>

    <!-- Success Notification Toast -->
    <div class="toast-notification" *ngIf="showToast">
      <mat-icon>check_circle</mat-icon>
      <span>Profile updated successfully!</span>
    </div>
  `,
  styles: [`
    .dashboard-header { margin-bottom: 2rem; }
    .profile-grid { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; }
    .profile-main { padding: 2.5rem; border-radius: 16px; position: relative; }
    .profile-header { display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem; width: 100%; }
    .profile-header.editing { margin-bottom: 1.5rem; }
    .edit-btn { margin-left: auto; display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 600; }
    .avatar { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); color: white; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15); transition: transform 0.3s ease; }
    .avatar:hover { transform: scale(1.05); }
    .avatar-edit-container { position: relative; cursor: pointer; }
    .avatar-overlay { position: absolute; top: 0; left: 0; width: 100px; height: 100px; border-radius: 50%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; opacity: 0; transition: opacity 0.3s ease; }
    .avatar-edit-container:hover .avatar-overlay { opacity: 1; }
    .info h2 { margin: 0 0 0.25rem 0; font-size: 1.8rem; font-weight: 800; color: var(--text-primary); }
    .info p { margin: 0; color: var(--text-secondary); font-size: 1.05rem; }
    .profile-details { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; padding-top: 2rem; }
    .detail-item label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-item span { font-weight: 700; font-size: 1.15rem; color: var(--text-primary); }
    
    .edit-form { padding-top: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .form-field { width: 100%; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .cancel-btn { border-color: rgba(255,255,255,0.15) !important; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 600; }
    .save-btn { padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
    
    .profile-stats { padding: 2.5rem; border-radius: 16px; }
    .profile-stats h3 { margin: 0 0 2rem 0; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
    .stat-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .stat-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .stat-row .label { color: var(--text-secondary); font-size: 0.95rem; }
    .stat-row .val { font-weight: 800; font-size: 1.3rem; color: var(--primary); }
    
    .toast-notification { position: fixed; bottom: 2rem; right: 2rem; background: var(--success); color: white; padding: 1rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 0.75rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 1000; font-weight: 600; }
    
    @keyframes slideIn {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @media (max-width: 968px) { .profile-grid { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class ProfileComponent {
  isEditing = false;
  showToast = false;

  profile = {
    name: 'Dr. Saagar',
    role: 'Senior Radiologist',
    email: 'dr.saagar@medvisionsort.com',
    organization: 'Central Diagnostic Center',
    memberSince: 'January 2024'
  };

  editName = '';
  editRole = '';
  editEmail = '';
  editOrganization = '';

  getInitials(): string {
    if (!this.profile.name) return 'DS';
    const parts = this.profile.name.split(' ');
    if (parts.length >= 2) {
      // Handle titles like Dr.
      if (parts[0].toLowerCase().includes('dr')) {
        return (parts[1].charAt(0) + (parts[2] ? parts[2].charAt(0) : parts[1].charAt(1))).toUpperCase();
      }
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return this.profile.name.substring(0, 2).toUpperCase();
  }

  startEdit() {
    this.editName = this.profile.name;
    this.editRole = this.profile.role;
    this.editEmail = this.profile.email;
    this.editOrganization = this.profile.organization;
    this.isEditing = true;
  }

  saveChanges() {
    this.profile.name = this.editName;
    this.profile.role = this.editRole;
    this.profile.email = this.editEmail;
    this.profile.organization = this.editOrganization;
    this.isEditing = false;

    // Show a beautiful toast notification
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  cancelEdit() {
    this.isEditing = false;
  }
}
