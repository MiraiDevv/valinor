import { Controller, Get, Post, Body, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { BoardService } from './board.service';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';

@Controller('api/board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  async getBoard() {
    try {
      return await this.boardService.getBoard();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('columns')
  async createColumn(@Body('title') title: string): Promise<Column> {
    try {
      return await this.boardService.createColumn(title);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('cards')
  async createCard(
    @Body('columnId') columnId: string,
    @Body('title') title: string,
    @Body('description') description: string,
  ): Promise<Card> {
    try {
      return await this.boardService.createCard(columnId, title, description);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('columns/:id')
  async deleteColumn(@Param('id') id: string): Promise<void> {
    try {
      await this.boardService.deleteColumn(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete('cards/:id')
  async deleteCard(@Param('id') id: string): Promise<void> {
    try {
      await this.boardService.deleteCard(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // Implement other endpoints like updateColumn, updateCard as needed
  @Post('cards/:id/move')
  async moveCard(
    @Param('id') cardId: string,
    @Body('columnId') targetColumnId: string,
    @Body('order') newOrder: number,
  ): Promise<Card> {
    try {
      return await this.boardService.moveCard(cardId, targetColumnId, newOrder);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
