import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { IBoard } from 'shared-types';
import { Column as ColumnEntity } from '../entities/column.entity';
import { User } from '../../users/entities/user.entity';

@Entity('boards')
export class Board implements IBoard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, user => user.boards)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ColumnEntity, column => column.board, { cascade: true })
  columns: ColumnEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 