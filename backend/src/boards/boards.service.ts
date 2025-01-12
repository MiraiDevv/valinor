import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { CreateBoardDto, UpdateBoardDto } from 'shared-types';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardsRepository: Repository<Board>,
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
    const board = this.boardsRepository.create({
      ...createBoardDto,
      userId,
    });
    return await this.boardsRepository.save(board);
  }

  async findAll(userId: string): Promise<Board[]> {
    return await this.boardsRepository.find({
      where: { userId },
      relations: ['columns', 'columns.cards', 'columns.cards.attachments'],
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findOne(id: string, userId: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id, userId },
      relations: ['columns', 'columns.cards', 'columns.cards.attachments']
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found or you don't have access to it`);
    }

    return board;
  }

  async update(id: string, userId: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.findOne(id, userId);
    Object.assign(board, updateBoardDto);
    return await this.boardsRepository.save(board);
  }

  async remove(id: string, userId: string): Promise<void> {
    const board = await this.findOne(id, userId);
    await this.boardsRepository.remove(board);
  }
} 