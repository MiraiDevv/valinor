import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board, Column, Card } from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private apiUrl = 'http://localhost:3000/api/board';

  constructor(private http: HttpClient) {}

  // Board operations
  getBoard(): Observable<Board> {
    return this.http.get<Board>(`${this.apiUrl}`);
  }

  // Column operations
  createColumn(title: string): Observable<Column> {
    return this.http.post<Column>(`${this.apiUrl}/columns`, { title });
  }

  updateColumn(columnId: string, title: string, order?: number): Observable<Column> {
    return this.http.patch<Column>(`${this.apiUrl}/columns/${columnId}`, { 
      title, 
      order 
    });
  }

  deleteColumn(columnId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/columns/${columnId}`);
  }

  // Card operations
  createCard(columnId: string, title: string, description: string): Observable<Card> {
    return this.http.post<Card>(`${this.apiUrl}/cards`, { columnId, title, description });
  }

  updateCard(cardId: string, updates: Partial<Card>): Observable<Card> {
    return this.http.patch<Card>(`${this.apiUrl}/cards/${cardId}`, updates);
  }

  deleteCard(cardId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cards/${cardId}`);
  }

  moveCard(cardId: string, targetColumnId: string, newOrder: number): Observable<Card> {
    return this.http.post<Card>(`${this.apiUrl}/cards/${cardId}/move`, {
      columnId: targetColumnId,
      order: newOrder
    });
  }
}
