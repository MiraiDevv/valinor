import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BoardService } from '../../../core/services/board.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-board-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center mb-8">
          <button
            (click)="goBack()"
            class="mr-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create New Board</h1>
        </div>

        <form [formGroup]="boardForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Board Title
            </label>
            <input
              type="text"
              id="title"
              formControlName="title"
              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:text-white"
              placeholder="Enter board title"
            />
            @if (boardForm.get('title')?.invalid && boardForm.get('title')?.touched) {
              <p class="mt-1 text-sm text-destructive">
                Title is required
              </p>
            }
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (optional)
            </label>
            <textarea
              id="description"
              formControlName="description"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:text-white"
              placeholder="Enter board description"
            ></textarea>
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              (click)="goBack()"
              class="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="boardForm.invalid || isLoading"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              @if (isLoading) {
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              } @else {
                Create Board
              }
            </button>
          </div>

          @if (error) {
            <div class="text-destructive text-sm text-center mt-2">
              {{ error }}
            </div>
          }
        </form>
      </div>
    </div>
  `
})
export class BoardCreateComponent {
  boardForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private boardService: BoardService,
    private router: Router,
    private authService: AuthService
  ) {
    this.boardForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['']
    });
  }

  onSubmit() {
    if (this.boardForm.invalid || this.isLoading) return;

    // Debug authentication state
    console.log('Auth check:', {
      isAuthenticated: this.authService.isAuthenticated(),
      token: this.authService.getToken(),
      currentUser: this.authService.getCurrentUser()
    });

    this.isLoading = true;
    this.error = null;

    this.boardService.createBoard(this.boardForm.value).subscribe({
      next: (board) => {
        this.isLoading = false;
        this.router.navigate(['/boards', board.id]);
      },
      error: (err) => {
        console.error('Error creating board:', err);
        this.error = err?.error?.message || 'Failed to create board';
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/boards']);
  }
} 