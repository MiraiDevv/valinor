import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Card } from '../models/card.model';
import { Comment, CreateCommentDto, UpdateCommentDto } from '../models/comment.model';
import { Activity } from '../models/activity.model';
import { WebSocketService, WebSocketMessage } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private wsService: WebSocketService
  ) {}

  // Card operations
  getCard(boardId: string, cardId: string): Observable<Card> {
    return this.http.get<Card>(`${this.apiUrl}/boards/${boardId}/cards/${cardId}`);
  }

  updateCard(boardId: string, cardId: string, card: Partial<Card>): Observable<Card> {
    return this.http.patch<Card>(
      `${this.apiUrl}/boards/${boardId}/cards/${cardId}`,
      card
    ).pipe(
      tap(updatedCard => {
        this.wsService.send({
          type: 'cardUpdated',
          data: updatedCard
        });
      })
    );
  }

  // Comment operations
  getComments(boardId: string, cardId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${this.apiUrl}/boards/${boardId}/cards/${cardId}/comments`
    );
  }

  addComment(boardId: string, cardId: string, comment: CreateCommentDto): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiUrl}/boards/${boardId}/cards/${cardId}/comments`,
      comment
    ).pipe(
      tap(newComment => {
        this.wsService.send({
          type: 'commentAdded',
          data: newComment
        });
      })
    );
  }

  updateComment(
    boardId: string,
    cardId: string,
    commentId: string,
    comment: UpdateCommentDto
  ): Observable<Comment> {
    return this.http.patch<Comment>(
      `${this.apiUrl}/boards/${boardId}/cards/${cardId}/comments/${commentId}`,
      comment
    ).pipe(
      tap(updatedComment => {
        this.wsService.send({
          type: 'commentUpdated',
          data: updatedComment
        });
      })
    );
  }

  deleteComment(boardId: string, cardId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/boards/${boardId}/cards/${cardId}/comments/${commentId}`
    ).pipe(
      tap(() => {
        this.wsService.send({
          type: 'commentDeleted',
          data: { boardId, cardId, commentId }
        });
      })
    );
  }

  // Activity operations
  getActivities(boardId: string, cardId: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(
      `${this.apiUrl}/boards/${boardId}/cards/${cardId}/activities`
    );
  }

  // WebSocket event listeners
  onCardUpdated(): Observable<Card> {
    return this.wsService.listen<Card>('cardUpdated');
  }

  onCommentAdded(): Observable<Comment> {
    return this.wsService.listen<Comment>('commentAdded');
  }

  onCommentUpdated(): Observable<Comment> {
    return this.wsService.listen<Comment>('commentUpdated');
  }

  onCommentDeleted(): Observable<{ boardId: string; cardId: string; commentId: string }> {
    return this.wsService.listen('commentDeleted');
  }
} 