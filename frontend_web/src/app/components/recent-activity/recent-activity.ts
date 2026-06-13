import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { MockApiService, MedicalImage } from '../../services/mock-api.service';
import { ImageViewerDialogComponent } from '../image-viewer-dialog/image-viewer-dialog';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatTooltipModule,
    MatDialogModule,
    MatPaginatorModule,
    RouterModule
  ],
  templateUrl: './recent-activity.html',
  styleUrl: './recent-activity.scss'
})
export class RecentActivityComponent implements OnChanges, AfterViewInit {
  @Input() recentImages: MedicalImage[] = [];
  
  displayedColumns: string[] = ['sno', 'date', 'image', 'type', 'accuracy', 'patientId', 'patientName', 'status', 'actions'];
  dataSource = new MatTableDataSource<MedicalImage>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog, private mockApi: MockApiService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['recentImages'] && this.recentImages) {
      this.dataSource.data = this.recentImages;
      setTimeout(() => {
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      });
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewImage(image: MedicalImage) {
    this.dialog.open(ImageViewerDialogComponent, {
      data: image,
      width: '900px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container'
    });
  }

  deleteImage(id: string) {
    if (confirm('Are you sure you want to delete this scan record?')) {
      this.mockApi.deleteImage(id).subscribe(() => {
        this.dataSource.data = this.dataSource.data.filter(img => img.id !== id);
      });
    }
  }
}
