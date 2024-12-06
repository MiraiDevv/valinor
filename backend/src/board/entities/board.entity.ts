import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Column } from './column.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Column, column => column.board, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE'
  })
  columns: Column[];
}
