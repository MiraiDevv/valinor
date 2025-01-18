import { Column } from './column.model';
import { Label } from './label.model';
import { User } from './user.model';

export interface Board {
  id: string;
  title: string;
  description?: string;
  columns: Column[];
  labels?: Label[];
  members?: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBoardDto {
  title: string;
  description?: string;
}

export interface UpdateBoardDto {
  title?: string;
  description?: string;
} 