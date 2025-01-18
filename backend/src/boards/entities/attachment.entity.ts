import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Card } from './card.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  url?: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  size?: number;

  @Column()
  cardId: string;

  @ManyToOne(() => Card, card => card.attachments, { onDelete: 'CASCADE' })
  card: Card;

  @CreateDateColumn()
  createdAt: Date;
} 