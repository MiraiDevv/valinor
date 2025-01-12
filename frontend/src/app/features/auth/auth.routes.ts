import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Sign in - Kanban Board'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Create account - Kanban Board'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
]; 