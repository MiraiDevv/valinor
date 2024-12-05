import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { BoardService } from '../../services/board.service';
import { Board, Column, Card } from '../../models/board.model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    CdkDragHandle,
  ],
})
export class BoardComponent implements OnInit {
  board: Board | null = null;
  loading = true;
  error: string | null = null;

  // State for modal
  deleteType: 'column' | 'card' | null = null;
  columnToDelete: Column | null = null;
  cardToDelete: Card | null = null;
  isModalOpen = false;

  // Dark mode state
  isDarkMode: boolean = false;

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.loadBoard();
    this.initializeDarkMode();
  }

  loadBoard(): void {
    this.loading = true;
    this.boardService.getBoard().subscribe({
      next: (board) => {
        this.board = board;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load board';
        this.loading = false;
        console.error('Error loading board:', error);
      },
    });
  }

  addColumn(): void {
    const title = prompt('Enter column title:');
    if (title) {
      this.boardService.createColumn(title).subscribe({
        next: (column) => {
          if (this.board) {
            this.board.columns.push(column);
          }
        },
        error: (error) => {
          console.error('Error creating column:', error);
          alert('Failed to create column. Please try again.');
        },
      });
    }
  }

  // Confirm deletion for Column
  confirmDeleteColumn(column: Column): void {
    this.deleteType = 'column';
    this.columnToDelete = column;
    this.cardToDelete = null;
    this.isModalOpen = true;
  }

  // Confirm deletion for Card
  confirmDeleteCard(card: Card, column: Column): void {
    this.deleteType = 'card';
    this.cardToDelete = card;
    this.columnToDelete = column;
    this.isModalOpen = true;
  }

  // Delete Column
  deleteColumn(): void {
    if (this.columnToDelete && this.deleteType === 'column') {
      this.boardService.deleteColumn(this.columnToDelete.id).subscribe({
        next: () => {
          if (this.board) {
            this.board.columns = this.board.columns.filter(
              (c) => c.id !== this.columnToDelete!.id
            );
          }
          this.closeModal();
          alert('Column deleted successfully.');
        },
        error: (error) => {
          console.error('Error deleting column:', error);
          alert('Failed to delete the column. Please try again.');
        },
      });
    }
  }

  // Delete Card
  deleteCard(): void {
    if (this.cardToDelete && this.deleteType === 'card' && this.columnToDelete) {
      this.boardService.deleteCard(this.cardToDelete.id).subscribe({
        next: () => {
          this.columnToDelete!.cards = this.columnToDelete!.cards.filter(
            (c) => c.id !== this.cardToDelete!.id
          );
          this.closeModal();
          alert('Card deleted successfully.');
        },
        error: (error) => {
          console.error('Error deleting card:', error);
          alert('Failed to delete the card. Please try again.');
        },
      });
    }
  }

  // Close Modal
  closeModal(): void {
    this.isModalOpen = false;
    this.deleteType = null;
    this.columnToDelete = null;
    this.cardToDelete = null;
  }

  addCard(column: Column): void {
    const title = prompt('Enter card title:');
    if (title) {
      const description = prompt('Enter card description:') || '';
      this.boardService.createCard(column.id, title, description).subscribe({
        next: (card) => {
          column.cards.push(card);
        },
        error: (error) => {
          console.error('Error creating card:', error);
          alert('Failed to create card. Please try again.');
        },
      });
    }
  }

  getConnectedList(): string[] {
    return this.board?.columns.map((column) => column.id) || [];
  }

  onCardDrop(event: CdkDragDrop<Card[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const card = event.container.data[event.currentIndex];
      this.boardService.moveCard(card.id, event.container.id, event.currentIndex).subscribe({
        error: (error) => {
          console.error('Error moving card:', error);
          // Revert the move
          moveItemInArray(
            event.container.data,
            event.currentIndex,
            event.previousIndex
          );
        },
      });
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const card = event.container.data[event.currentIndex];
      this.boardService.moveCard(card.id, event.container.id, event.currentIndex).subscribe({
        error: (error) => {
          console.error('Error moving card:', error);
          // Revert the move
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
        },
      });
    }
  }

  onColumnDrop(event: CdkDragDrop<Column[]>): void {
    if (!this.board) return;

    moveItemInArray(this.board.columns, event.previousIndex, event.currentIndex);

    // Update column orders in the backend
    this.board.columns.forEach((column, index) => {
      this.boardService.updateColumn(column.id, column.title, index).subscribe({
        error: (error) => {
          console.error('Error updating column order:', error);
          // Revert the move on error
          if (this.board) {
            moveItemInArray(
              this.board.columns,
              event.currentIndex,
              event.previousIndex
            );
          }
        },
      });
    });
  }

  // Initialize Dark Mode based on user preference or system settings
  initializeDarkMode(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedPreference = localStorage.getItem('darkMode') === 'true';
    this.isDarkMode = savedPreference || prefersDark;
    this.applyDarkMode();
  }

  // Toggle Dark Mode
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyDarkMode();
    localStorage.setItem('darkMode', String(this.isDarkMode));
  }

  // Apply Dark Mode by adding/removing the 'dark' class on <html>
  applyDarkMode(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
