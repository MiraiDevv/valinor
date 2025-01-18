import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ICard } from 'shared-types';
import { Column as ColumnEntity } from './column.entity';
import { Label } from './label.entity';
import { User } from '../../users/entities/user.entity';
import { Attachment } from './attachment.entity';

@Entity('cards')
export class Card implements ICard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  order: number;

  @Column()
  columnId: string;

  @Column({ nullable: true })
  coverColor?: string;

  @OneToMany(() => Attachment, attachment => attachment.card, { cascade: true })
  attachments?: Attachment[];

  @ManyToOne(() => ColumnEntity, column => column.cards, { onDelete: 'CASCADE' })
  column: ColumnEntity;

  @ManyToMany(() => Label, { cascade: true })
  @JoinTable()
  labels?: Label[];

  @ManyToMany(() => User)
  @JoinTable()
  assignees?: User[];

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 