import { User } from './user.model';

export interface Comment {
  id: string;
  content: string;
  cardId: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentDto {
  content: string;
  cardId: string;
}

export interface UpdateCommentDto {
  content: string;
} 