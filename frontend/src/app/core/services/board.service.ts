import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Board, CreateBoardDto, UpdateBoardDto } from '../models/board.model';
import { Column, CreateColumnDto, UpdateColumnDto } from '../models/column.model';
import { Card, CreateCardDto, UpdateCardDto } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private apiUrl = `${environment.apiUrl}/boards`;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => error);
  }

  // Board methods
  getBoards(): Observable<Board[]> {
    console.log('Fetching boards from:', this.apiUrl);
    return this.http.get<Board[]>(this.apiUrl).pipe(
      tap(boards => console.log('Boards fetched successfully:', boards)),
      catchError(this.handleError)
    );
  }

  getBoard(id: string): Observable<Board> {
    console.log(`Fetching board ${id} from: ${this.apiUrl}/${id}`);
    return this.http.get<Board>(`${this.apiUrl}/${id}`).pipe(
      tap(board => console.log('Board fetched successfully:', board)),
      catchError(this.handleError)
    );
  }

  createBoard(board: CreateBoardDto): Observable<Board> {
    return this.http.post<Board>(this.apiUrl, board);
  }

  updateBoard(id: string, board: UpdateBoardDto): Observable<Board> {
    return this.http.patch<Board>(`${this.apiUrl}/${id}`, board);
  }

  deleteBoard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Column methods
  createColumn(boardId: string, column: CreateColumnDto): Observable<Column> {
    return this.http.post<Column>(`${this.apiUrl}/${boardId}/columns`, column);
  }

  updateColumn(boardId: string, columnId: string, column: UpdateColumnDto): Observable<Column> {
    return this.http.patch<Column>(`${this.apiUrl}/${boardId}/columns/${columnId}`, column);
  }

  deleteColumn(boardId: string, columnId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${boardId}/columns/${columnId}`);
  }

  reorderColumns(boardId: string, columnIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${boardId}/columns/reorder`, columnIds);
  }

  // Card methods
  createCard(boardId: string, columnId: string, card: CreateCardDto): Observable<Card> {
    return this.http.post<Card>(`${this.apiUrl}/${boardId}/columns/${columnId}/cards`, card);
  }

  updateCard(boardId: string, columnId: string, cardId: string, card: UpdateCardDto): Observable<Card> {
    console.log('BoardService.updateCard called with:', {
      boardId,
      columnId,
      cardId,
      card
    });
    const url = `${this.apiUrl}/${boardId}/columns/${columnId}/cards/${cardId}`;
    console.log('Making PATCH request to:', url);
    return this.http.patch<Card>(url, card);
  }

  deleteCard(boardId: string, columnId: string, cardId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${boardId}/columns/${columnId}/cards/${cardId}`);
  }

  reorderCards(boardId: string, columnId: string, cardIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${boardId}/columns/${columnId}/cards/reorder`, cardIds);
  }

  moveCard(boardId: string, cardId: string, targetColumnId: string, order: number): Observable<Card> {
    return this.http.post<Card>(`${this.apiUrl}/${boardId}/cards/${cardId}/move`, {
      columnId: targetColumnId,
      order
    });
  }
} 