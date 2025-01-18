import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { Board } from '../../../core/models/board.model';

@Component({
  selector: 'app-board-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  template: `
    <app-dialog
      [title]="'Edit Board'"
      [(isOpen)]="isOpen"
    >
      <form (ngSubmit)="onSubmit()" #boardForm="ngForm" class="space-y-4">
        <div>
          <label
            for="title"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            [(ngModel)]="formData.title"
            required
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800"
            [class.border-red-500]="titleInput.invalid && titleInput.touched"
            #titleInput="ngModel"
          />
          @if (titleInput.invalid && titleInput.touched) {
            <p class="mt-1 text-sm text-red-500">Title is required</p>
          }
        </div>

        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            [(ngModel)]="formData.description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            (click)="isOpen = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="boardForm.invalid || isLoading"
            class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
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
              Saving...
            } @else {
              Save
            }
          </button>
        </div>
      </form>
    </app-dialog>
  `
})
export class BoardDialogComponent {
  @Input() board: Board | null = null;
  @Input() isLoading = false;
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<{ title: string; description?: string }>();

  formData: { title: string; description?: string } = {
    title: '',
    description: ''
  };

  ngOnChanges(): void {
    if (this.board) {
      this.formData = {
        title: this.board.title,
        description: this.board.description
      };
    }
  }

  onSubmit(): void {
    if (!this.isLoading) {
      this.save.emit(this.formData);
    }
  }
} 