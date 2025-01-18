import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [publicOnlyGuard]
  },
  {
    path: 'boards',
    loadChildren: () => import('./features/boards/boards.routes').then(m => m.BOARDS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'boards',
    pathMatch: 'full'
  }
];
