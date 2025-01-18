import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Logger } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto, UpdateBoardDto } from 'shared-types';
import { Board } from './entities/board.entity';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  private readonly logger = new Logger(BoardsController.name);

  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  create(
    @Body() createBoardDto: CreateBoardDto,
    @Request() req
  ): Promise<Board> {
    return this.boardsService.create(createBoardDto, req.user.id);
  }

  @Get()
  findAll(@Request() req): Promise<Board[]> {
    this.logger.debug(`User from JWT: ${JSON.stringify(req.user)}`);
    return this.boardsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req
  ): Promise<Board> {
    return this.boardsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Request() req
  ): Promise<Board> {
    return this.boardsService.update(id, req.user.id, updateBoardDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req
  ): Promise<void> {
    return this.boardsService.remove(id, req.user.id);
  }
} 