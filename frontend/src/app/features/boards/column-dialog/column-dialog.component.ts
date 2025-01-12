import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { Column } from '../../../core/models/column.model';

@Component({
  selector: 'app-column-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogComponent],
  template: `
    <app-dialog [title]="column ? 'Edit Column' : 'Add Column'" [(isOpen)]="isOpen">
      <form [formGroup]="columnForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            id="title"
            formControlName="title"
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:text-white"
            placeholder="Enter column title"
          />
          @if (columnForm.get('title')?.invalid && columnForm.get('title')?.touched) {
            <p class="mt-1 text-sm text-destructive">Title is required</p>
          }
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
            [disabled]="columnForm.invalid || isLoading"
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
              {{ column ? 'Updating...' : 'Creating...' }}
            } @else {
              {{ column ? 'Update' : 'Create' }}
            }
          </button>
        </div>
      </form>
    </app-dialog>
  `
})
export class ColumnDialogComponent {
  @Input() column: Column | null = null;
  @Input() isLoading = false;
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<{ title: string }>();

  columnForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.columnForm = this.fb.group({
      title: ['', Validators.required]
    });
  }

  ngOnChanges(): void {
    if (this.column) {
      this.columnForm.patchValue({
        title: this.column.title
      });
    } else {
      this.columnForm.reset();
    }
  }

  onSubmit(): void {
    if (this.columnForm.valid && !this.isLoading) {
      this.save.emit(this.columnForm.value);
    }
  }
} 