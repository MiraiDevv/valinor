import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardModule } from './board/board.module';
import { Board } from './board/entities/board.entity';
import { Column } from './board/entities/column.entity';
import { Card } from './board/entities/card.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'valinor',
      password: process.env.DATABASE_PASSWORD || 'valinor123',
      database: process.env.DATABASE_NAME || 'valinor',
      entities: [Board, Column, Card],
      synchronize: true, // Set to false in production
    }),
    BoardModule,
  ],
})
export class AppModule {}
