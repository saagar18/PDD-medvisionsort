import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule, 
    NavbarComponent, 
    FooterComponent, 
    MatCardModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    FormsModule
  ],
  template: `
    <app-navbar></app-navbar>
    <main class="contact-page">
      <div class="container">
        <div class="page-header">
          <h1>Contact Us</h1>
          <p>We're here to help you modernize your healthcare workflow</p>
        </div>

        <div class="contact-grid">
          <div class="contact-info">
            <div class="info-card glass-panel">
              <mat-icon>location_on</mat-icon>
              <div>
                <h3>Visit Us</h3>
                <p>123 Health Tech St, Innovation City, 10101</p>
              </div>
            </div>
            <div class="info-card glass-panel">
              <mat-icon>email</mat-icon>
              <div>
                <h3>Email Us</h3>
                <p>support&#64;medvisionsort.com</p>
              </div>
            </div>
            <div class="info-card glass-panel">
              <mat-icon>phone</mat-icon>
              <div>
                <h3>Call Us</h3>
                <p>+1 (555) 000-0000</p>
              </div>
            </div>
          </div>

          <mat-card class="contact-form glass-panel">
            <form #f="ngForm">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>First Name</mat-label>
                  <input matInput name="first" ngModel required>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Last Name</mat-label>
                  <input matInput name="last" ngModel required>
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Address</mat-label>
                <input matInput type="email" name="email" ngModel required>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Organization</mat-label>
                <input matInput name="org" ngModel>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Message</mat-label>
                <textarea matInput rows="5" name="msg" ngModel required></textarea>
              </mat-form-field>
              <button mat-flat-button class="btn-primary full-width" [disabled]="!f.valid">Send Message</button>
            </form>
          </mat-card>
        </div>
      </div>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .contact-page { padding-top: 120px; padding-bottom: 60px; }
    .page-header { text-align: center; margin-bottom: 4rem; }
    .page-header h1 { font-size: 3rem; margin-bottom: 1rem; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 3rem; }
    .contact-info { display: flex; flex-direction: column; gap: 1.5rem; }
    .info-card { display: flex; align-items: center; gap: 1.5rem; padding: 2rem; }
    .info-card mat-icon { font-size: 32px; width: 32px; height: 32px; color: var(--primary); }
    .info-card h3 { font-size: 1.25rem; margin-bottom: 0.25rem; }
    .info-card p { color: var(--text-secondary); }
    .contact-form { padding: 3rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .full-width { width: 100%; margin-bottom: 0.5rem; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }
  `]
})
export class ContactComponent {}
