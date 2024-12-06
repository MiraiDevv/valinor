import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Column as BoardColumn } from './column.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  // Add the 'order' property
  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => BoardColumn, (column) => column.cards, { onDelete: 'CASCADE' })
  column: BoardColumn;
}