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

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'categories',
    children: [
      { path: '', component: CategoriesListComponent },
      { path: 'form', component: CategoriesFormComponent },
    ],
  },
  {
    path: 'transactions',
    children: [
      { path: '', component: TransactionsListComponent },
      { path: 'form', component: TransactionsFormComponent },
    ],
  },
  { path: 'reports', component: ReportsComponent },
  { path: 'profile', component: ProfileComponent },
];
