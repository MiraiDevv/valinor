import { Component, EventEmitter, Input, Output, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { Card } from '../../../core/models/card.model';
import { User } from '../../../core/models/user.model';
import { Label } from '../../../core/models/label.model';
import { Comment, CreateCommentDto, UpdateCommentDto } from '../../../core/models/comment.model';
import { Activity, ActivityType } from '../../../core/models/activity.model';
import { AuthService } from '../../../core/services/auth.service';
import { CardService } from '../../../core/services/card.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogComponent, ConfirmationDialogComponent],
  template: `
    <app-dialog [title]="card?.title || 'Card Details'" [(isOpen)]="isOpen">
      <div class="space-y-6">
        <!-- Description -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
          @if (isEditingDescription) {
            <form [formGroup]="descriptionForm" (ngSubmit)="saveDescription()">
              <textarea
                formControlName="description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:text-white"
                placeholder="Add a more detailed description..."
              ></textarea>
              <div class="mt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  (click)="cancelEditDescription()"
                  class="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="descriptionForm.invalid || isSaving"
                  class="px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>
          } @else {
            <div
              class="prose prose-sm dark:prose-invert max-w-none"
              (click)="startEditDescription()"
            >
              @if (card?.description) {
                <p class="text-gray-700 dark:text-gray-300">{{ card.description }}</p>
              } @else {
                <p class="text-gray-500 dark:text-gray-400 italic">
                  Add a more detailed description...
                </p>
              }
            </div>
          }
        </div>

        <!-- Labels -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Labels</h3>
          <div class="flex flex-wrap gap-2">
            @for (label of card?.labels || []; track label.id) {
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                [style.backgroundColor]="label.color + '33'"
                [style.color]="label.color"
              >
                {{ label.name }}
              </span>
            }
          </div>
        </div>

        <!-- Assignees -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assignees</h3>
          <div class="flex -space-x-1">
            @for (user of card?.assignees || []; track user.id) {
              <img
                [src]="user.avatarUrl || 'assets/default-avatar.png'"
                [alt]="user.name"
                class="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
              />
            }
          </div>
        </div>

        <!-- Comments -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comments</h3>
          
          <!-- New Comment Form -->
          <form [formGroup]="commentForm" (ngSubmit)="addComment()" class="mb-4">
            <textarea
              formControlName="content"
              rows="2"
              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:text-white"
              placeholder="Write a comment..."
            ></textarea>
            <div class="mt-2 flex justify-end">
              <button
                type="submit"
                [disabled]="commentForm.invalid || isAddingComment"
                class="px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                @if (isAddingComment) {
                  <span class="inline-flex items-center">
                    <svg
                      class="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    Adding...
                  </span>
                } @else {
                  Add Comment
                }
              </button>
            </div>
          </form>

          <!-- Comments List -->
          <div class="space-y-4">
            @for (comment of comments(); track comment.id) {
              <div class="flex space-x-3">
                <img
                  [src]="comment.author.avatarUrl || 'assets/default-avatar.png'"
                  [alt]="comment.author.name"
                  class="h-8 w-8 rounded-full"
                />
                <div class="flex-1">
                  <div class="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                    <div class="flex items-center justify-between">
                      <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ comment.author.name }}
                      </h4>
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ comment.createdAt | date:'medium' }}
                      </span>
                    </div>
                    @if (editingCommentId() === comment.id) {
                      <form [formGroup]="editCommentForm" (ngSubmit)="saveComment(comment)">
                        <textarea
                          formControlName="content"
                          rows="2"
                          class="mt-2 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:text-white"
                        ></textarea>
                        <div class="mt-2 flex justify-end space-x-2">
                          <button
                            type="button"
                            (click)="cancelEditComment()"
                            class="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            [disabled]="editCommentForm.invalid || isEditingComment"
                            class="px-2 py-1 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    } @else {
                      <p class="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {{ comment.content }}
                      </p>
                      @if (comment.author.id === currentUser()?.id) {
                        <div class="mt-2 flex space-x-2">
                          <button
                            (click)="startEditComment(comment)"
                            class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            Edit
                          </button>
                          <button
                            (click)="deleteComment(comment)"
                            class="text-xs text-destructive hover:text-destructive/90"
                          >
                            Delete
                          </button>
                        </div>
                      }
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Activity -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity</h3>
          <div class="space-y-4">
            @for (activity of activities(); track activity.id) {
              <div class="flex space-x-3">
                <img
                  [src]="activity.user.avatarUrl || 'assets/default-avatar.png'"
                  [alt]="activity.user.name"
                  class="h-8 w-8 rounded-full"
                />
                <div class="flex-1">
                  <div class="text-sm text-gray-700 dark:text-gray-300">
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ activity.user.name }}
                    </span>
                    {{ getActivityDescription(activity) }}
                  </div>
                  <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ activity.createdAt | date:'medium' }}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </app-dialog>

    <!-- Confirmation Dialog -->
    <app-confirmation-dialog
      [(isOpen)]="isDeleteDialogOpen"
      [title]="'Delete Comment'"
      [message]="'Are you sure you want to delete this comment? This action cannot be undone.'"
      (confirm)="handleDeleteComment()"
    />
  `
})
export class CardDetailComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() card: Card | null = null;
  @Input() boardId = '';
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() cardUpdated = new EventEmitter<Partial<Card>>();

  comments = signal<Comment[]>([]);
  activities = signal<Activity[]>([]);
  currentUser = signal<User | null>(null);
  
  isEditingDescription = false;
  isSaving = false;
  isAddingComment = false;
  isEditingComment = false;
  isDeleteDialogOpen = false;
  editingCommentId = signal<string | null>(null);
  commentToDelete: Comment | null = null;

  private destroy$ = new Subject<void>();

  descriptionForm: FormGroup;
  commentForm: FormGroup;
  editCommentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cardService: CardService
  ) {
    this.descriptionForm = this.fb.group({
      description: ['']
    });

    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.editCommentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  ngOnInit() {
    this.setupWebSocketListeners();
  }

  ngOnChanges() {
    if (this.card) {
      this.descriptionForm.patchValue({
        description: this.card.description
      });
      this.loadCardData();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupWebSocketListeners() {
    // Listen for card updates
    this.cardService.onCardUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(updatedCard => {
        if (updatedCard.id === this.card?.id) {
          this.cardUpdated.emit(updatedCard);
        }
      });

    // Listen for new comments
    this.cardService.onCommentAdded()
      .pipe(takeUntil(this.destroy$))
      .subscribe(newComment => {
        if (newComment.cardId === this.card?.id) {
          this.comments.update(comments => [...comments, newComment]);
        }
      });

    // Listen for comment updates
    this.cardService.onCommentUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(updatedComment => {
        if (updatedComment.cardId === this.card?.id) {
          this.comments.update(comments =>
            comments.map(c => c.id === updatedComment.id ? updatedComment : c)
          );
        }
      });

    // Listen for comment deletions
    this.cardService.onCommentDeleted()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ cardId, commentId }) => {
        if (cardId === this.card?.id) {
          this.comments.update(comments =>
            comments.filter(c => c.id !== commentId)
          );
        }
      });
  }

  private loadCardData() {
    if (!this.card || !this.boardId) return;

    // Load comments
    this.cardService.getComments(this.boardId, this.card.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(comments => {
        this.comments.set(comments);
      });

    // Load activities
    this.cardService.getActivities(this.boardId, this.card.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(activities => {
        this.activities.set(activities);
      });
  }

  startEditDescription() {
    this.isEditingDescription = true;
  }

  cancelEditDescription() {
    this.isEditingDescription = false;
    this.descriptionForm.patchValue({
      description: this.card?.description
    });
  }

  saveDescription() {
    if (this.descriptionForm.valid && this.card && this.boardId) {
      this.isSaving = true;
      this.cardService.updateCard(this.boardId, this.card.id, this.descriptionForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedCard) => {
            this.cardUpdated.emit(updatedCard);
            this.isEditingDescription = false;
            this.isSaving = false;
          },
          error: () => {
            this.isSaving = false;
          }
        });
    }
  }

  addComment() {
    if (this.commentForm.valid && this.card && this.boardId) {
      this.isAddingComment = true;
      const comment: CreateCommentDto = {
        content: this.commentForm.value.content,
        cardId: this.card.id
      };

      this.cardService.addComment(this.boardId, this.card.id, comment)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.commentForm.reset();
            this.isAddingComment = false;
          },
          error: () => {
            this.isAddingComment = false;
          }
        });
    }
  }

  startEditComment(comment: Comment) {
    this.editingCommentId.set(comment.id);
    this.editCommentForm.patchValue({
      content: comment.content
    });
  }

  cancelEditComment() {
    this.editingCommentId.set(null);
    this.editCommentForm.reset();
  }

  saveComment(comment: Comment) {
    if (this.editCommentForm.valid && this.card && this.boardId) {
      this.isEditingComment = true;
      const updateDto: UpdateCommentDto = {
        content: this.editCommentForm.value.content
      };

      this.cardService.updateComment(this.boardId, this.card.id, comment.id, updateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.editingCommentId.set(null);
            this.editCommentForm.reset();
            this.isEditingComment = false;
          },
          error: () => {
            this.isEditingComment = false;
          }
        });
    }
  }

  deleteComment(comment: Comment) {
    this.commentToDelete = comment;
    this.isDeleteDialogOpen = true;
  }

  handleDeleteComment() {
    if (this.commentToDelete && this.card && this.boardId) {
      this.cardService.deleteComment(this.boardId, this.card.id, this.commentToDelete.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isDeleteDialogOpen = false;
            this.commentToDelete = null;
          }
        });
    }
  }

  getActivityDescription(activity: Activity): string {
    switch (activity.type) {
      case ActivityType.CARD_CREATED:
        return 'created this card';
      case ActivityType.CARD_UPDATED:
        return 'updated the card description';
      case ActivityType.CARD_MOVED:
        return `moved this card from ${activity.data['fromColumn']} to ${activity.data['toColumn']}`;
      case ActivityType.COMMENT_ADDED:
        return 'added a comment';
      case ActivityType.COMMENT_UPDATED:
        return 'edited a comment';
      case ActivityType.COMMENT_DELETED:
        return 'deleted a comment';
      case ActivityType.MEMBER_ADDED:
        return `assigned ${activity.data['memberName']} to this card`;
      case ActivityType.MEMBER_REMOVED:
        return `removed ${activity.data['memberName']} from this card`;
      case ActivityType.LABEL_ADDED:
        return `added the ${activity.data['labelName']} label`;
      case ActivityType.LABEL_REMOVED:
        return `removed the ${activity.data['labelName']} label`;
      default:
        return 'performed an action';
    }
  }
} 