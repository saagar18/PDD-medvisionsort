import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `
    <div class="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The system could not locate the requested resource.</p>
      <a href="/" class="home-btn">Return to Dashboard</a>
    </div>
  `,
  styles: [`
    .not-found-container {
      height: 80vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #f8fafc;
      text-align: center;
    }
    h1 {
      font-size: 96px;
      color: #38bdf8;
      margin: 0;
    }
    h2 {
      font-size: 32px;
      margin-bottom: 16px;
    }
    p {
      color: #94a3b8;
      margin-bottom: 32px;
    }
    .home-btn {
      padding: 12px 24px;
      background: #38bdf8;
      color: #0f172a;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
    }
  `]
})
export class NotFound {}
