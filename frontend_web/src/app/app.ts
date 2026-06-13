import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar';
import { Auth } from './services/auth';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  template: `
    <div [class.app-container]="showSidebar" [class.public-view]="!showSidebar">
      <app-sidebar *ngIf="showSidebar"></app-sidebar>
      <main [class.main-content]="showSidebar">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: var(--bg-primary);
    }
    .main-content {
      flex: 1;
      height: 100vh;
      overflow-y: auto;
      padding: 2.5rem;
      box-sizing: border-box;
      transition: all 0.3s ease;
    }
    .public-view {
      display: block;
      height: auto;
      width: 100%;
      overflow: visible;
      padding: 0;
    }
    :host {
      display: block;
    }
  `]
})
export class App {
  showSidebar = false;

  constructor(public auth: Auth, private router: Router) {
    // Show sidebar on all pages except Landing, Login, and Register
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const publicPages = ['/', '/login', '/register', '/about', '/features', '/contact'];
      this.showSidebar = !publicPages.includes(event.urlAfterRedirects) && this.auth.isLoggedIn();
    });
  }
}
