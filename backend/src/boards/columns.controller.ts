import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto, UpdateColumnDto } from 'shared-types';
import { Column } from './entities/column.entity';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { BoardsService } from './boards.service';

@Controller('boards/:boardId/columns')
@UseGuards(JwtAuthGuard)
export class ColumnsController {
  constructor(
    private readonly columnsService: ColumnsService,
    private readonly boardsService: BoardsService
  ) {}

  @Post()
  async create(
    @Param('boardId') boardId: string,
    @Body() createColumnDto: CreateColumnDto,
    @Request() req
  ): Promise<Column> {
    // Verify board ownership
    await this.boardsService.findOne(boardId, req.user.id);
    return this.columnsService.create({ ...createColumnDto, boardId });
  }

  @Get()
  async findByBoard(
    @Param('boardId') boardId: string,
    @Request() req
  ): Promise<Column[]> {
    // Verify board ownership
    await this.boardsService.findOne(boardId, req.user.id);
    return this.columnsService.findByBoard(boardId);
  }

  @Get(':id')
  async findOne(
    @Param('boardId') boardId: string,
    @Param('id') id: string,
    @Request() req
  ): Promise<Column> {
    // Verify board ownership
    await this.boardsService.findOne(boardId, req.user.id);
    return this.columnsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('boardId') boardId: string,
    @Param('id') id: string,
    @Body() updateColumnDto: UpdateColumnDto,
    @Request() req
  ): Promise<Column> {
    // Verify board ownership
    await this.boardsService.findOne(boardId, req.user.id);
    return this.columnsService.update(id, updateColumnDto);
  }

  @Delete(':id')
  async remove(
    @Param('boardId') boardId: string,
    @Param('id') id: string,
    @Request() req
  ): Promise<void> {
    // Verify board ownership
    await this.boardsService.findOne(boardId, req.user.id);
    return this.columnsService.remove(id);
  }

  @Post('reorder')
  async reorder(
    @Param('boardId') boardId: string,
    @Body() columnIds: string[],
    @Request() req
  ): Promise<void> {
    // Verify board ownership
    await this.boardsService.findOne(boardId, req.user.id);
    return this.columnsService.reorder(boardId, columnIds);
  }
} 