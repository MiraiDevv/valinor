import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ILabel } from 'shared-types';

@Entity('labels')
export class Label implements ILabel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  color: string;
} 