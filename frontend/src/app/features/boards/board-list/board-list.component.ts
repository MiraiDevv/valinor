import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BoardService } from '../../../core/services/board.service';
import { Board } from '../../../core/models/board.model';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { delay, retryWhen, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Boards</h1>
        <a
          routerLink="new"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <svg
            class="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          New Board
        </a>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      } @else if (error()) {
        <div class="text-center py-12">
          <div class="text-destructive mb-4">{{ error() }}</div>
          <button
            (click)="loadBoards()"
            class="text-sm text-primary hover:text-primary/90"
          >
            Try again
          </button>
        </div>
      } @else if (boards().length === 0) {
        <div class="text-center py-12">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No boards yet</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">Create your first board to get started</p>
          <a
            routerLink="new"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Create Board
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (board of boards(); track board.id) {
            <a
              [routerLink]="[board.id]"
              class="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
            >
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {{ board.title }}
              </h2>
              @if (board.description) {
                <p class="text-gray-500 dark:text-gray-400 line-clamp-2">
                  {{ board.description }}
                </p>
              }
              <div class="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div class="flex items-center">
                  <svg
                    class="mr-1.5 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z"
                    />
                  </svg>
                  {{ board.columns?.length || 0 }} {{ board.columns?.length === 1 ? 'column' : 'columns' }}
                </div>
                <div class="flex items-center">
                  <svg
                    class="mr-1.5 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fill-rule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ getTotalCards(board) }} {{ getTotalCards(board) === 1 ? 'card' : 'cards' }}
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class BoardListComponent implements OnInit {
  boards = signal<Board[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private boardService: BoardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      console.log('Not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadBoards();
  }

  getTotalCards(board: Board): number {
    return board.columns?.reduce((total, column) => total + (column.cards?.length || 0), 0) || 0;
  }

  loadBoards() {
    this.isLoading.set(true);
    this.error.set(null);

    this.boardService.getBoards()
      .pipe(
        retryWhen(errors => 
          errors.pipe(
            tap(err => {
              console.log('Error loading boards:', err);
              if (err.status !== 401) {
                throw err;
              }
            }),
            delay(1000),
            take(3)
          )
        )
      )
      .subscribe({
        next: (boards) => {
          console.log('Boards loaded successfully:', boards);
          this.boards.set(boards);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load boards after retries:', err);
          if (err.status === 401) {
            this.router.navigate(['/auth/login']);
          }
          this.error.set(err.error?.message || 'Failed to load boards');
          this.isLoading.set(false);
        }
      });
  }
} 