import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Observable, Subject, share } from 'rxjs';
import { AuthService } from './auth.service';

export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: Socket;
  private messagesSubject = new Subject<WebSocketMessage>();
  public messages$ = this.messagesSubject.asObservable().pipe(share());

  constructor(private authService: AuthService) {
    this.setupSocket();
  }

  private setupSocket() {
    this.socket = io(`${environment.wsUrl}/boards`, {
      transports: ['websocket', 'polling'],
      auth: {
        token: this.authService.getToken()
      },
      autoConnect: true,
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connection established');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket connection closed');
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    // Listen for all events and forward them to the messages subject
    ['board.updated', 'column.created', 'column.updated', 'column.deleted', 
     'card.created', 'card.updated', 'card.deleted'].forEach(eventType => {
      this.socket.on(eventType, (data: any) => {
        this.messagesSubject.next({ type: eventType, data });
      });
    });
  }

  public send(message: WebSocketMessage) {
    this.socket.emit(message.type, message.data);
  }

  public onBoardUpdated(): Observable<any> {
    return this.listen<any>('board.updated');
  }

  public onColumnCreated(): Observable<any> {
    return this.listen<any>('column.created');
  }

  public onColumnUpdated(): Observable<any> {
    return this.listen<any>('column.updated');
  }

  public onColumnDeleted(): Observable<any> {
    return this.listen<any>('column.deleted');
  }

  public onCardCreated(): Observable<any> {
    return this.listen<any>('card.created');
  }

  public onCardUpdated(): Observable<any> {
    return this.listen<any>('card.updated');
  }

  public onCardDeleted(): Observable<any> {
    return this.listen<any>('card.deleted');
  }

  public listen<T>(type: string): Observable<T> {
    return new Observable(subscriber => {
      const subscription = this.messages$.subscribe(message => {
        if (message.type === type) {
          subscriber.next(message.data as T);
        }
      });
      return () => subscription.unsubscribe();
    });
  }

  public joinBoard(boardId: string) {
    this.send({ type: 'joinBoard', data: { boardId } });
  }

  public leaveBoard(boardId: string) {
    this.send({ type: 'leaveBoard', data: { boardId } });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
} 