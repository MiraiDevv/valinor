import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from 'shared-types';
import { Card } from './entities/card.entity';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { BoardsService } from './boards.service';

@Controller('boards/:boardId/columns/:columnId/cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly boardsService: BoardsService
  ) {}

  @Post()
  async create(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() createCardDto: CreateCardDto,
    @Request() req
  ): Promise<Card> {
    // Verify board ownership
    await this.boardsService.findOne(boardId, req.user.id);
    return this.cardsService.create({ ...createCardDto, columnId });
  }

  @Get()
  async findByColumn(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Request() req
  ): Promise<Card[]> {
    // Verify board ownership
    await this.boardsService.findOne(boardId, req.user.id);
    return this.cardsService.findByColumn(columnId);
  }

  @Get(':id')
  async findOne(
    @Param('boardId') boardId: string,
    @Param('id') id: string,
    @Request() req
  ): Promise<Card> {
    // Verify board ownership
    await this.boardsService.findOne(boardId, req.user.id);
    return this.cardsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('boardId') boardId: string,
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @Request() req
  ): Promise<Card> {
    // Verify board ownership
    await this.boardsService.findOne(boardId, req.user.id);
    return this.cardsService.update(id, updateCardDto);
  }

  @Delete(':id')
  async remove(
    @Param('boardId') boardId: string,
    @Param('id') id: string,
    @Request() req
  ): Promise<void> {
    // Verify board ownership
    await this.boardsService.findOne(boardId, req.user.id);
    return this.cardsService.remove(id);
  }

  @Post('reorder')
  async reorder(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() cardIds: string[],
    @Request() req
  ): Promise<void> {
    // Verify board ownership
    await this.boardsService.findOne(boardId, req.user.id);
    return this.cardsService.reorder(columnId, cardIds);
  }
} 