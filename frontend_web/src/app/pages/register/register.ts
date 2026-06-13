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
  selector: 'app-register',
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
  templateUrl: './register.html',
  styleUrl: '../login/login.scss' // Reuse login styles
})
export class RegisterComponent {
  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  showPassword = false;
  errorMessage = '';

  constructor(private auth: Auth) {}

  async onSubmit() {
    try {
      this.errorMessage = '';
      await this.auth.register(this.registerData.email, this.registerData.password);
    } catch (error: any) {
      this.errorMessage = error.message || 'Registration failed.';
    }
  }
}
