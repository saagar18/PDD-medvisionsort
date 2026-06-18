import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCardComponent } from '../../components/image-card/image-card';
import { MedicalApiService, MedicalImage } from '../../services/medical-api.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [
    CommonModule, 
    ImageCardComponent, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.scss'
})
export class ImageGalleryComponent implements OnInit {
  images: MedicalImage[] = [];
  filteredImages: MedicalImage[] = [];
  searchTerm: string = '';
  filterType: string = 'All';

  constructor(private medicalApi: MedicalApiService) {}

  ngOnInit() {
    this.medicalApi.getRecentImages().subscribe(data => {
      this.images = data;
      this.filteredImages = data;
    });
  }

  applyFilters() {
    this.filteredImages = this.images.filter(img => {
      const matchesSearch = img.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            img.type.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = this.filterType === 'All' || img.type === this.filterType;
      return matchesSearch && matchesType;
    });
  }
}
