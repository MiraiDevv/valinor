import { Card } from './card.model';

export interface Column {
  id: string;
  title: string;
  order: number;
  boardId: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateColumnDto {
  title: string;
  boardId: string;
  order?: number;
}

export interface UpdateColumnDto {
  title?: string;
  order?: number;
} 