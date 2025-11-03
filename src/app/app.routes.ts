import { Routes } from '@angular/router';
import { LandingComponent } from './screens/landing/landing.component';
import { LoginComponent } from './screens/auth/login/login.component';
import { RegisterComponent } from './screens/auth/register/register.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },

  // Publicas
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  // Dashboard (lazy load)
  {
    path: 'dashboard',
    loadComponent: () => import('./screens/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },

  // Transactions (lazy load, protegido)
  {
    path: 'transactions',
    loadComponent: () => import('./screens/transactions/list/list.component').then(m => m.ListComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'form',
        loadComponent: () => import('./screens/transactions/form/form.component').then(m => m.FormComponent),
        canActivate: [AuthGuard]
      }
    ]
  },

  // Categories: solo admin (lazy + guard por rol)
  {
    path: 'categories',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./screens/categories/list/list.component').then(m => m.ListComponent),
    children: [
      {
        path: 'form',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./screens/categories/form/form.component').then(m => m.FormComponent)
      }
    ]
  },

  // Reports (lazy)
  {
    path: 'reports',
    loadComponent: () => import('./screens/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [AuthGuard]
  },

  // Profile (lazy)
  {
    path: 'profile',
    loadComponent: () => import('./screens/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },

  // fallback
  { path: '**', redirectTo: '' }
];