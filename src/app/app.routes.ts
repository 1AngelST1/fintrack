import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { PublicGuard } from './shared/guards/public.guard';
import { RoleGuard } from './shared/guards/role.guard';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { PrivateLayoutComponent } from './layouts/private-layout/private-layout.component';

export const routes: Routes = [
  // =============== RUTAS PÚBLICAS ===============
  {
    path: '',
    component: PublicLayoutComponent,
    canActivate: [PublicGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./screens/landing/landing.component').then(m => m.LandingComponent)
      },
      {
        path: 'auth/login',
        loadComponent: () => import('./screens/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'auth/register',
        loadComponent: () => import('./screens/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },

  // =============== RUTAS PRIVADAS (PROTEGIDAS) ===============
  {
    path: '',
    component: PrivateLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./screens/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // Transactions
      {
        path: 'transactions',
        loadComponent: () => import('./screens/transactions/list/list.component').then(m => m.ListComponent)
      },
      {
        path: 'transactions/form',
        loadComponent: () => import('./screens/transactions/form/form.component').then(m => m.FormComponent)
      },
      {
        path: 'transactions/form/:id',
        loadComponent: () => import('./screens/transactions/form/form.component').then(m => m.FormComponent)
      },

      // Categories (solo admin)
      {
        path: 'categories',
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./screens/categories/list/list.component').then(m => m.ListComponent)
      },
      {
        path: 'categories/form',
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./screens/categories/form/form.component').then(m => m.FormComponent)
      },
      {
        path: 'categories/form/:id',
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./screens/categories/form/form.component').then(m => m.FormComponent)
      },

      // Reports
      {
        path: 'reports',
        loadComponent: () => import('./screens/reports/reports.component').then(m => m.ReportsComponent)
      },

      // Profile
      {
        path: 'profile',
        loadComponent: () => import('./screens/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },

  // =============== FALLBACK ===============
  { path: '**', redirectTo: '' }
];