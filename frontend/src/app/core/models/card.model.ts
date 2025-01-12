import { Label } from './label.model';
import { User } from './user.model';

export interface Attachment {
  id?: string;
  name: string;
  url?: string;
  type?: string;
  size?: number;
  createdAt?: Date;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  coverColor?: string;
  attachments?: Attachment[];
  columnId: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCardDto {
  title: string;
  description?: string;
  columnId: string;
  order?: number;
  coverColor?: string;
  attachments?: Attachment[];
  dueDate?: Date;
  labelIds?: string[];
  assigneeIds?: string[];
}

export interface UpdateCardDto {
  title?: string;
  description?: string | null;
  columnId?: string;
  order?: number;
  coverColor?: string | null;
  attachments?: Attachment[];
  dueDate?: Date | null;
  labelIds?: string[];
  assigneeIds?: string[];
} 