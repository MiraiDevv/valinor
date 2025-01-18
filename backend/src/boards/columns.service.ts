import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Column } from './entities/column.entity';
import { CreateColumnDto, UpdateColumnDto } from 'shared-types';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ColumnsService {
  private readonly logger = new Logger(ColumnsService.name);

  constructor(
    @InjectRepository(Column)
    private columnsRepository: Repository<Column>,
    private eventsGateway: EventsGateway
  ) {}

  async create(createColumnDto: CreateColumnDto): Promise<Column> {
    const column = this.columnsRepository.create(createColumnDto);
    const savedColumn = await this.columnsRepository.save(column) as Column;
    
    try {
      this.eventsGateway.notifyColumnCreated(createColumnDto.boardId, savedColumn);
      this.eventsGateway.notifyBoardUpdate(createColumnDto.boardId, { columns: await this.findByBoard(createColumnDto.boardId) });
    } catch (error) {
      this.logger.warn(`Failed to send WebSocket notification: ${error.message}`);
    }
    
    return savedColumn;
  }

  findAll(): Promise<Column[]> {
    return this.columnsRepository.find({
      relations: ['cards', 'cards.labels', 'cards.assignees', 'board']
    });
  }

  findByBoard(boardId: string): Promise<Column[]> {
    return this.columnsRepository.find({
      where: { boardId },
      relations: ['cards', 'cards.labels', 'cards.assignees', 'board'],
      order: { order: 'ASC' }
    });
  }

  findOne(id: string): Promise<Column> {
    return this.columnsRepository.findOne({
      where: { id },
      relations: ['cards', 'cards.labels', 'cards.assignees', 'board']
    });
  }

  async update(id: string, updateColumnDto: UpdateColumnDto): Promise<Column> {
    const column = await this.findOne(id);
    await this.columnsRepository.update(id, updateColumnDto);
    const updatedColumn = await this.findOne(id);
    
    try {
      this.eventsGateway.notifyColumnUpdated(column.boardId, updatedColumn);
      this.eventsGateway.notifyBoardUpdate(column.boardId, { columns: await this.findByBoard(column.boardId) });
    } catch (error) {
      this.logger.warn(`Failed to send WebSocket notification: ${error.message}`);
    }
    
    return updatedColumn;
  }

  async remove(id: string): Promise<void> {
    const column = await this.findOne(id);
    await this.columnsRepository.delete(id);
    
    try {
      this.eventsGateway.notifyColumnDeleted(column.boardId, column);
      this.eventsGateway.notifyBoardUpdate(column.boardId, { columns: await this.findByBoard(column.boardId) });
    } catch (error) {
      this.logger.warn(`Failed to send WebSocket notification: ${error.message}`);
    }
  }

  async reorder(boardId: string, columnIds: string[]): Promise<void> {
    await Promise.all(
      columnIds.map((columnId, index) =>
        this.columnsRepository.update(columnId, { order: index, boardId })
      )
    );
    const updatedColumns = await this.findByBoard(boardId);
    
    try {
      this.eventsGateway.notifyBoardUpdate(boardId, { columns: updatedColumns });
    } catch (error) {
      this.logger.warn(`Failed to send WebSocket notification: ${error.message}`);
    }
  }
} 