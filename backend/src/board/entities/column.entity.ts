import { Entity, PrimaryGeneratedColumn, Column as TypeOrmColumn, OneToMany, ManyToOne } from 'typeorm';
import { Card } from './card.entity';
import { Board } from './board.entity';

@Entity()
export class Column {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TypeOrmColumn()
  title: string;

  @OneToMany(() => Card, card => card.column, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE'
  })
  cards: Card[];

  @ManyToOne(() => Board, board => board.columns, {
    onDelete: 'CASCADE'
  })
  board: Board;
}
