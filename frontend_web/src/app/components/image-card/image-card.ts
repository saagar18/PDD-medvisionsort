import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MedicalImage } from '../../services/mock-api.service';

@Component({
  selector: 'app-image-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './image-card.html',
  styleUrl: './image-card.scss'
})
export class ImageCardComponent {
  @Input() image!: MedicalImage;
}
