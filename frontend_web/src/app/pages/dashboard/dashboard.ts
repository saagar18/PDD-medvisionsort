import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { StatsCardsComponent } from '../../components/stats-cards/stats-cards';
import { RecentActivityComponent } from '../../components/recent-activity/recent-activity';
import { MockApiService, MedicalImage } from '../../services/mock-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    RouterModule,
    StatsCardsComponent,
    RecentActivityComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  stats: any = {};
  recentImages: MedicalImage[] = [];

  constructor(private mockApi: MockApiService) {}

  ngOnInit() {
    this.mockApi.getStats().subscribe(data => this.stats = data);
    this.mockApi.getRecentImages().subscribe(data => this.recentImages = data);
  }
}
