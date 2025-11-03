import { Routes } from '@angular/router';

// Screens
import { LandingComponent } from './screens/landing/landing.component';
import { LoginComponent } from './screens/auth/login/login.component';
import { RegisterComponent } from './screens/auth/register/register.component';
import { DashboardComponent } from './screens/dashboard/dashboard.component';
import { ListComponent as CategoriesListComponent } from './screens/categories/list/list.component';
import { FormComponent as CategoriesFormComponent } from './screens/categories/form/form.component';
import { ListComponent as TransactionsListComponent } from './screens/transactions/list/list.component';
import { FormComponent as TransactionsFormComponent } from './screens/transactions/form/form.component';
import { ReportsComponent } from './screens/reports/reports.component';
import { ProfileComponent } from './screens/profile/profile.component';

import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  {
    path: 'categories',
    canActivate: [RoleGuard],
    children: [
      { path: '', component: CategoriesListComponent },
      { path: 'form', component: CategoriesFormComponent },
    ],
  },
  {
    path: 'transactions',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: TransactionsListComponent },
      { path: 'form', component: TransactionsFormComponent },
    ],
  },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
];