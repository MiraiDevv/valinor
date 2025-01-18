import { DataSource } from 'typeorm';
import { Board } from './boards/entities/board.entity';
import { Column } from './boards/entities/column.entity';
import { Card } from './boards/entities/card.entity';
import { User } from './users/entities/user.entity';
import { Label } from './boards/entities/label.entity';
import { Attachment } from './boards/entities/attachment.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'valinor',
  synchronize: false,
  logging: true,
  entities: [Board, Column, Card, User, Label, Attachment],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
}); 