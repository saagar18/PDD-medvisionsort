import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  // VULN-06 FIX: No default credentials — fields start empty
  loginData = {
    email: '',
    password: ''
  };
  showPassword = false;
  errorMessage = '';

  constructor(private auth: Auth) {}

  async onSubmit() {
    try {
      this.errorMessage = '';
      await this.auth.login(this.loginData.email, this.loginData.password);
    } catch (error: any) {
      this.errorMessage = error.message || 'Invalid email or password.';
    }
  }
}
