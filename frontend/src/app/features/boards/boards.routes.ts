import { Routes } from '@angular/router';
import { BoardListComponent } from './board-list/board-list.component';
import { BoardCreateComponent } from './board-create/board-create.component';
import { BoardDetailComponent } from './board-detail/board-detail.component';

export const BOARDS_ROUTES: Routes = [
  {
    path: '',
    component: BoardListComponent,
    title: 'My Boards - Kanban Board'
  },
  {
    path: 'new',
    component: BoardCreateComponent,
    title: 'Create Board - Kanban Board'
  },
  {
    path: ':id',
    component: BoardDetailComponent,
    title: 'Board Details - Kanban Board'
  }
]; 