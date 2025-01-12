import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header class="bg-white dark:bg-gray-800 shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              <a routerLink="/" class="hover:text-primary">Valinor</a>
            </h1>
            <nav>
              @if (authService.isAuthenticated()) {
                <div class="flex items-center space-x-4">
                  <a routerLink="/boards" class="text-gray-600 dark:text-gray-300 hover:text-primary">My Boards</a>
                  <button 
                    (click)="authService.logout()"
                    class="text-gray-600 dark:text-gray-300 hover:text-primary"
                  >
                    Logout
                  </button>
                </div>
              } @else {
                <div class="flex items-center space-x-4">
                  <a routerLink="/auth/login" class="text-gray-600 dark:text-gray-300 hover:text-primary">Login</a>
                  <a 
                    routerLink="/auth/register"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
                  >
                    Sign up
                  </a>
                </div>
              }
            </nav>
          </div>
        </div>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
