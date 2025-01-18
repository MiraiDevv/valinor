import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, switchMap, of } from 'rxjs';
import { Subject } from 'rxjs';
import { BoardService } from '../../../core/services/board.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Board } from '../../../core/models/board.model';
import { Column } from '../../../core/models/column.model';
import { Card, Attachment } from '../../../core/models/card.model';
import { ColumnDialogComponent } from '../column-dialog/column-dialog.component';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { BoardDialogComponent } from '../board-dialog/board-dialog.component';
import { CreateCardDto, UpdateCardDto } from '../../../core/models/card.model';

@Component({
  selector: 'app-board-detail',
  templateUrl: './board-detail.component.html',
  styleUrls: ['./board-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ColumnDialogComponent,
    CardDialogComponent,
    ConfirmationDialogComponent,
    BoardDialogComponent
  ]
})
export class BoardDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private boardId: string | null = null;

  board = signal<Board | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Dialog and loading states
  isColumnDialogOpen = false;
  isColumnLoading = false;
  selectedColumn: Column | null = null;

  // Delete column dialog state
  isDeleteColumnDialogOpen = false;
  isDeleteColumnLoading = false;
  columnToDelete: Column | null = null;

  // Card dialog and loading states
  isCardDialogOpen = false;
  isCardLoading = false;
  selectedCard: Card | null = null;

  // Delete card dialog state
  isDeleteCardDialogOpen = false;
  isDeleteCardLoading = false;
  cardToDelete: Card | null = null;

  // Board dialog and loading states
  isBoardDialogOpen = false;
  isBoardLoading = false;

  // Delete board dialog state
  isDeleteBoardDialogOpen = false;
  isDeleteBoardLoading = false;

  // Computed and utility properties
  sortedColumns = computed<Column[]>(() => {
    const current = this.board();
    if (!current || !current.columns) return [];
    return [...current.columns].sort((a, b) => a.order - b.order);
  });

  totalCards = computed<number>(() => {
    const current = this.board();
    if (!current || !current.columns) return 0;
    return current.columns.reduce((total, column) => total + (column.cards?.length || 0), 0);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    // Load the board based on the route parameter and set up real-time subscriptions
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.boardId = params.get('id');
          if (!this.boardId) {
            return of(null);
          }
          return this.boardService.getBoard(this.boardId);
        })
      )
      .subscribe({
        next: (board: Board | null) => {
          if (board) {
            this.board.set(board);
          }
          this.isLoading.set(false);
      this.setupWebSocket();
        },
        error: (err: { error?: { message?: string } }) => {
          this.error.set(err?.error?.message || 'Failed to load board');
          this.isLoading.set(false);
    }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.boardId) {
      this.wsService.leaveBoard(this.boardId);
    }
  }

  private setupWebSocket(): void {
    if (!this.boardId) return;

    // Join the board's room
    this.wsService.joinBoard(this.boardId);

    // Listen for board-wide updates
    this.wsService.onBoardUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe((updatedBoard: Board) => {
        this.board.set(updatedBoard);
      });

    // Listen for newly created columns
    this.wsService.onColumnCreated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Reloading the board ensures all clients stay in sync
        this.loadBoard();
      });

    // Listen for updated columns
    this.wsService.onColumnUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe((updatedColumn: Column) => {
        // Selectively update the column in local state for efficiency
        const existingBoard = this.board();
        if (existingBoard && existingBoard.columns) {
          const updatedBoard = { ...existingBoard };
          updatedBoard.columns = updatedBoard.columns.map((col) =>
            col.id === updatedColumn.id ? updatedColumn : col
          );
          this.board.set(updatedBoard);
        }
      });

    // Listen for card events
    this.wsService.onCardCreated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadBoard();
      });

    this.wsService.onCardUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe((updatedCard: Card) => {
        const existingBoard = this.board();
        if (existingBoard && existingBoard.columns) {
          const updatedBoard = { ...existingBoard };
          updatedBoard.columns = updatedBoard.columns.map(col => ({
            ...col,
            cards: col.cards?.map(card => 
              card.id === updatedCard.id ? updatedCard : card
            )
          }));
          this.board.set(updatedBoard);
        }
      });

    this.wsService.onCardDeleted()
      .pipe(takeUntil(this.destroy$))
      .subscribe((deletedCard: Card) => {
        const existingBoard = this.board();
        if (existingBoard && existingBoard.columns) {
          const updatedBoard = { ...existingBoard };
          updatedBoard.columns = updatedBoard.columns.map(col => ({
            ...col,
            cards: col.cards?.filter(card => card.id !== deletedCard.id)
          }));
          this.board.set(updatedBoard);
        }
      });
  }

  loadBoard(): void {
    if (!this.boardId) return;
    this.isLoading.set(true);

    this.boardService.getBoard(this.boardId).subscribe({
      next: (board) => {
        this.board.set(board);
        this.isLoading.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message || 'Failed to load board');
        this.isLoading.set(false);
      }
    });
  }

  showColumnDialog(column?: Column) {
    this.selectedColumn = column || null;
    this.isColumnDialogOpen = true;
  }

  handleColumnSave(data: { title: string }) {
    if (!this.boardId) return;
    this.isColumnLoading = true;

    const request = this.selectedColumn
      ? this.boardService.updateColumn(this.boardId, this.selectedColumn.id, data)
      : this.boardService.createColumn(this.boardId, {
          ...data,
          boardId: this.boardId,
          order: this.sortedColumns().length
        });

    request.subscribe({
      next: (newOrUpdatedColumn: Column) => {
        // If we're creating a new column, add it locally for instant feedback
        if (!this.selectedColumn && newOrUpdatedColumn && this.board()) {
          const updatedBoard = { ...this.board()! };
          updatedBoard.columns = [...(updatedBoard.columns || []), newOrUpdatedColumn];
          this.board.set(updatedBoard);
        } else if (this.selectedColumn) {
          // If we're updating an existing column, reflect that change locally
          const existingBoard = this.board();
          if (existingBoard && existingBoard.columns) {
            const updatedBoard = { ...existingBoard };
            updatedBoard.columns = updatedBoard.columns.map((col) =>
              col.id === newOrUpdatedColumn.id ? newOrUpdatedColumn : col
            );
            this.board.set(updatedBoard);
          }
        }

        this.isColumnLoading = false;
        this.isColumnDialogOpen = false;
        this.selectedColumn = null;
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message || 'Failed to save column');
        this.isColumnLoading = false;
      }
    });
  }

  deleteColumn(column: Column): void {
    this.columnToDelete = column;
    this.isDeleteColumnDialogOpen = true;
  }

  confirmDeleteColumn(): void {
    if (!this.boardId || !this.columnToDelete) return;
    this.isDeleteColumnLoading = true;

    this.boardService.deleteColumn(this.boardId, this.columnToDelete.id).subscribe({
      next: () => {
        // Update local state by removing the deleted column
        const existingBoard = this.board();
        if (existingBoard && existingBoard.columns) {
          const updatedBoard = { ...existingBoard };
          updatedBoard.columns = updatedBoard.columns.filter(
            (col) => col.id !== this.columnToDelete?.id
          );
          this.board.set(updatedBoard);
        }

        // Reset states
        this.isDeleteColumnLoading = false;
        this.isDeleteColumnDialogOpen = false;
        this.columnToDelete = null;
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message || 'Failed to delete column');
        this.isDeleteColumnLoading = false;
      }
    });
  }

  showCardDialog(card?: Card, column?: Column) {
    this.selectedCard = card || null;
    this.selectedColumn = column || null;
    this.isCardDialogOpen = true;
  }

  handleCardSave(data: { title: string; description?: string; coverColor?: string; attachments?: Attachment[] }) {
    if (!this.boardId || !this.selectedColumn) return;
    this.isCardLoading = true;

    if (this.selectedCard) {
      // Update existing card
      const updateData: UpdateCardDto = {
        title: data.title,
        description: data.description ?? null,
        coverColor: data.coverColor ?? null,
        columnId: this.selectedColumn.id,
        order: this.selectedCard.order,
        attachments: data.attachments ?? []
      };

      this.boardService
        .updateCard(this.boardId, this.selectedColumn.id, this.selectedCard.id, updateData)
        .subscribe({
          next: (updatedCard: Card) => {
            // Update local state
            const existingBoard = this.board();
            if (existingBoard && existingBoard.columns) {
              const updatedBoard = { ...existingBoard };
              updatedBoard.columns = updatedBoard.columns.map(col => {
                if (col.id === this.selectedColumn?.id) {
                  return {
                    ...col,
                    cards: col.cards?.map(card =>
                      card.id === updatedCard.id ? updatedCard : card
                    )
                  };
                }
                return col;
              });
              this.board.set(updatedBoard);
            }

            this.closeCardDialog();
          },
          error: (err: { error?: { message?: string } }) => {
            console.error('Failed to update card:', err);
            this.error.set(err?.error?.message || 'Failed to update card');
            this.isCardLoading = false;
          }
        });
    } else {
      // Create new card
      const createData: CreateCardDto = {
        title: data.title,
        description: data.description || '',
        coverColor: data.coverColor || '#ffffff',
        columnId: this.selectedColumn.id,
        order: this.selectedColumn.cards?.length ?? 0
      };

      this.boardService
        .createCard(this.boardId, this.selectedColumn.id, createData)
        .subscribe({
          next: (newCard: Card) => {
            // Update local state
            const existingBoard = this.board();
            if (existingBoard && existingBoard.columns) {
              const updatedBoard = { ...existingBoard };
              updatedBoard.columns = updatedBoard.columns.map(col => {
                if (col.id === this.selectedColumn?.id) {
                  return {
                    ...col,
                    cards: [...(col.cards || []), newCard]
                  };
                }
                return col;
              });
              this.board.set(updatedBoard);
            }

            this.closeCardDialog();
          },
          error: (err: { error?: { message?: string } }) => {
            console.error('Failed to create card:', err);
            this.error.set(err?.error?.message || 'Failed to create card');
            this.isCardLoading = false;
          }
        });
    }
  }

  private closeCardDialog(): void {
    this.isCardLoading = false;
    this.isCardDialogOpen = false;
    this.selectedCard = null;
    this.selectedColumn = null;
  }

  deleteCard(card: Card): void {
    this.cardToDelete = card;
    this.isDeleteCardDialogOpen = true;
  }

  confirmDeleteCard(): void {
    if (!this.boardId || !this.cardToDelete) return;
    this.isDeleteCardLoading = true;

    const column = this.board()?.columns?.find(col =>
      col.cards?.some(c => c.id === this.cardToDelete?.id)
    );

    if (!column) {
      this.error.set('Column not found');
      this.isDeleteCardLoading = false;
      return;
    }

    this.boardService
      .deleteCard(this.boardId, column.id, this.cardToDelete.id)
      .subscribe({
        next: () => {
          // Update local state
          const existingBoard = this.board();
          if (existingBoard && existingBoard.columns) {
            const updatedBoard = { ...existingBoard };
            updatedBoard.columns = updatedBoard.columns.map(col => ({
              ...col,
              cards: col.cards?.filter(c => c.id !== this.cardToDelete?.id)
            }));
            this.board.set(updatedBoard);
          }

          this.isDeleteCardLoading = false;
          this.isDeleteCardDialogOpen = false;
          this.cardToDelete = null;
        },
        error: (err: { error?: { message?: string } }) => {
          this.error.set(err?.error?.message || 'Failed to delete card');
          this.isDeleteCardLoading = false;
        }
      });
  }

  showBoardDialog(): void {
    this.isBoardDialogOpen = true;
  }

  handleBoardSave(data: { title: string; description?: string }): void {
    if (!this.boardId) return;
    this.isBoardLoading = true;

    this.boardService.updateBoard(this.boardId, data).subscribe({
      next: (updatedBoard: Board) => {
        this.board.set(updatedBoard);
        this.isBoardLoading = false;
        this.isBoardDialogOpen = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message || 'Failed to update board');
        this.isBoardLoading = false;
      }
    });
  }

  deleteBoard(): void {
    this.isDeleteBoardDialogOpen = true;
  }

  confirmDeleteBoard(): void {
    if (!this.boardId) return;
    this.isDeleteBoardLoading = true;

    this.boardService.deleteBoard(this.boardId).subscribe({
      next: () => {
        this.isDeleteBoardLoading = false;
        this.isDeleteBoardDialogOpen = false;
        this.router.navigate(['/boards']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message || 'Failed to delete board');
        this.isDeleteBoardLoading = false;
      }
    });
  }
} 