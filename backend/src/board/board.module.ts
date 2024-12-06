import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { Board } from './entities/board.entity';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Column, Card])],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
