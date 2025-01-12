export interface IBoard {
    id: string;
    title: string;
    description?: string;
    columns: IColumn[];
    createdAt: Date;
    updatedAt: Date;
}
export interface IColumn {
    id: string;
    title: string;
    order: number;
    boardId: string;
    cards: ICard[];
    createdAt: Date;
    updatedAt: Date;
}
export interface ICard {
    id: string;
    title: string;
    description?: string;
    order: number;
    columnId: string;
    coverColor?: string;
    attachments?: IAttachment[];
    labels?: ILabel[];
    assignees?: IUser[];
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ILabel {
    id: string;
    name: string;
    color: string;
}
export interface IUser {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
}
export interface IAttachment {
    id?: string;
    name: string;
    url?: string;
    type?: string;
    size?: number;
    cardId?: string;
    createdAt?: Date;
}
export interface CreateBoardDto {
    title: string;
    description?: string;
}
export interface UpdateBoardDto {
    title?: string;
    description?: string;
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
export interface CreateCardDto {
    title: string;
    description?: string;
    columnId: string;
    order?: number;
    coverColor?: string;
    attachments?: IAttachment[];
    dueDate?: Date;
}
export interface UpdateCardDto {
    title?: string;
    description?: string;
    columnId?: string;
    order?: number;
    coverColor?: string;
    attachments?: IAttachment[];
    dueDate?: Date;
}
