import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { MedicalApiService } from '../../services/medical-api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  stats: any = {};

  features = [
    {
      icon: 'psychology',
      title: 'AI Classification',
      desc: 'Advanced deep learning models to accurately identify image modalities.'
    },
    {
      icon: 'speed',
      title: 'Real-time Processing',
      desc: 'Sort hundreds of medical images in seconds with our optimized pipeline.'
    },
    {
      icon: 'security',
      title: 'HIPAA Compliant',
      desc: 'Enterprise-grade security ensuring patient data privacy and safety.'
    },
    {
      icon: 'cloud_upload',
      title: 'Multi-format Support',
      desc: 'Seamlessly handle DICOM, JPG, PNG, and more with one interface.'
    }
  ];

  constructor(private medicalApi: MedicalApiService) {}

  ngOnInit() {
    this.medicalApi.getStats().subscribe(data => {
      this.stats = data;
    });
  }
}
