import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { UploadComponent } from './pages/upload/upload';
import { AboutComponent } from './pages/about/about';
import { FeaturesComponent } from './pages/features/features';
import { ContactComponent } from './pages/contact/contact';
import { ImageDetailsComponent } from './pages/image-details/image-details';
import { ImageGalleryComponent } from './components/image-gallery/image-gallery';
import { ProfileComponent } from './pages/profile/profile';
import { DiagnosticsComponent } from './pages/diagnostics/diagnostics';
import { StatisticsComponent } from './pages/statistics/statistics';
import { ReportsComponent } from './pages/reports/reports';
import { SettingsComponent } from './pages/settings/settings';
import { NotFound } from './pages/not-found/not-found';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: RegisterComponent },
  { path: 'about', component: AboutComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'contact', component: ContactComponent },
  { 
    path: 'dashboard', 
    component: Dashboard, 
    canActivate: [authGuard] 
  },
  { 
    path: 'upload', 
    component: UploadComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'images', 
    component: ImageGalleryComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'image/:id', 
    component: ImageDetailsComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'diagnostics', 
    component: DiagnosticsComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'statistics', 
    component: StatisticsComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'reports', 
    component: ReportsComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'settings', 
    component: SettingsComponent, 
    canActivate: [authGuard] 
  },
  { path: '**', component: NotFound }
];
