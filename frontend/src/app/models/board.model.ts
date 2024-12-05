export interface Board {
  id: string;
  title: string;
  columns: Column[];
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
  order: number;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
