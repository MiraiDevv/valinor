import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Board } from '../boards/entities/board.entity';
import { Column } from '../boards/entities/column.entity';
import { Card } from '../boards/entities/card.entity';
import { Label } from '../boards/entities/label.entity';
import { User } from '../users/entities/user.entity';
import { Attachment } from '../boards/entities/attachment.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DATABASE_HOST', 'localhost'),
  port: configService.get('DATABASE_PORT', 5432),
  username: configService.get('DATABASE_USER', 'postgres'),
  password: configService.get('DATABASE_PASSWORD', 'postgres'),
  database: configService.get('DATABASE_NAME', 'valinor'),
  entities: [Board, Column, Card, Label, User, Attachment],
  synchronize: configService.get('NODE_ENV', 'development') === 'development',
  logging: configService.get('NODE_ENV', 'development') === 'development',
}); 