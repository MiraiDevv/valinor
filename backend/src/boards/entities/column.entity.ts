import { Column as TypeOrmColumn, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IColumn } from 'shared-types';
import { Board } from './board.entity';
import { Card } from './card.entity';

@Entity('columns')
export class Column implements IColumn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TypeOrmColumn()
  title: string;

  @TypeOrmColumn()
  order: number;

  @TypeOrmColumn()
  boardId: string;

  @ManyToOne(() => Board, board => board.columns, { onDelete: 'CASCADE' })
  board: Board;

  @OneToMany(() => Card, card => card.column, { cascade: true })
  cards: Card[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 