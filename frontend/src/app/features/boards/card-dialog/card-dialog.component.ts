import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { Card, Attachment } from '../../../core/models/card.model';

@Component({
  selector: 'app-card-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  template: `
    <app-dialog
      [title]="card ? 'Edit Card' : 'Add Card'"
      [(isOpen)]="isOpen"
      (isOpenChange)="onClose()"
    >
      <form (ngSubmit)="onSubmit()" #cardForm="ngForm" class="space-y-4">
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

        <div>
          <label
            for="coverColor"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Cover Color
          </label>
          <input
            type="color"
            id="coverColor"
            name="coverColor"
            [(ngModel)]="formData.coverColor"
            (change)="onColorChange($event)"
            class="mt-1 block rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Attachments
          </label>
          <div class="mt-2 space-y-2">
            @for (attachment of formData.attachments; track attachment.name; let i = $index) {
              <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span class="text-sm">{{ attachment.name }}</span>
                <button
                  type="button"
                  (click)="onRemoveAttachment(i)"
                  class="text-destructive hover:text-destructive/90"
                >
                  Remove
                </button>
              </div>
            }
            <div class="flex items-center justify-center w-full">
              <label class="w-full flex flex-col items-center px-4 py-6 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg shadow-lg tracking-wide border border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <svg class="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                </svg>
                <span class="mt-2 text-sm">Select a file</span>
                <input
                  type='file'
                  class="hidden"
                  (change)="onAddAttachment($event)"
                />
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            (click)="onClose()"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="cardForm.invalid || isLoading"
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
              {{ card ? 'Save' : 'Create' }}
            }
          </button>
        </div>
      </form>
    </app-dialog>
  `
})
export class CardDialogComponent {
  @Input() card: Card | null = null;
  @Input() isLoading = false;
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<{
    title: string;
    description?: string;
    coverColor?: string;
    attachments?: Attachment[];
  }>();

  formData: {
    title: string;
    description?: string;
    coverColor?: string;
    attachments?: Attachment[];
  } = {
    title: '',
    description: '',
    coverColor: '#ffffff',
    attachments: []
  };

  ngOnChanges(): void {
    if (this.isOpen) {
      if (this.card) {
        this.formData = {
          title: this.card.title,
          description: this.card.description,
          coverColor: this.card.coverColor || '#ffffff',
          attachments: this.card.attachments || []
        };
      } else {
        this.resetForm();
      }
    }
  }

  private resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      coverColor: '#ffffff',
      attachments: []
    };
  }

  onClose(): void {
    this.resetForm();
    this.isOpenChange.emit(false);
  }

  onSubmit(): void {
    if (this.isLoading) return;
    this.save.emit(this.formData);
  }

  onColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.formData.coverColor = input.value;
    } else {
      this.formData.coverColor = '#ffffff';
    }
  }

  onAddAttachment(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const newAttachment: Attachment = {
        name: file.name,
        type: file.type,
        size: file.size
      };
      this.formData.attachments = [...(this.formData.attachments || []), newAttachment];
    }
  }

  onRemoveAttachment(index: number): void {
    if (this.formData.attachments) {
      this.formData.attachments = this.formData.attachments.filter((_, i) => i !== index);
    }
  }
} 