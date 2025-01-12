import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';
import { Label } from './entities/label.entity';
import { Attachment } from './entities/attachment.entity';
import { BoardsController } from './boards.controller';
import { ColumnsController } from './columns.controller';
import { CardsController } from './cards.controller';
import { BoardsService } from './boards.service';
import { ColumnsService } from './columns.service';
import { CardsService } from './cards.service';
import { EventsModule } from '../events/events.module';
import { BoardsGateway } from './boards.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, Column, Card, Label, Attachment]),
    EventsModule,
  ],
  controllers: [CardsController, ColumnsController, BoardsController],
  providers: [BoardsService, ColumnsService, CardsService, BoardsGateway],
  exports: [BoardsService, ColumnsService, CardsService],
})
export class BoardsModule {} 