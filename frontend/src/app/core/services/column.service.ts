import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Column, CreateColumnDto, UpdateColumnDto } from '../models/column.model';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {
  private apiUrl = `${environment.apiUrl}/columns`;

  constructor(private http: HttpClient) {}

  getColumns(boardId: string): Observable<Column[]> {
    return this.http.get<Column[]>(`${this.apiUrl}/board/${boardId}`);
  }

  getColumn(id: string): Observable<Column> {
    return this.http.get<Column>(`${this.apiUrl}/${id}`);
  }

  createColumn(column: CreateColumnDto): Observable<Column> {
    return this.http.post<Column>(this.apiUrl, column);
  }

  updateColumn(id: string, column: UpdateColumnDto): Observable<Column> {
    return this.http.patch<Column>(`${this.apiUrl}/${id}`, column);
  }

  deleteColumn(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reorderColumns(boardId: string, columnIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/board/${boardId}/reorder`, columnIds);
  }
} 