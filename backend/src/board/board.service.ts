import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {
    this.initializeBoard();
  }

  private async initializeBoard() {
    try {
      const boards = await this.boardRepository.find({
        take: 1,
      });

      if (boards.length === 0) {
        this.logger.log('No board found, creating initial board');
        const board = this.boardRepository.create({
          columns: [
            {
              title: 'To Do',
              cards: [
                {
                  title: 'First Task',
                  description: 'This is your first task',
                },
              ],
            },
            {
              title: 'In Progress',
              cards: [],
            },
            {
              title: 'Done',
              cards: [],
            },
          ],
        });

        await this.boardRepository.save(board);
        this.logger.log('Initial board created successfully');
      }
    } catch (error) {
      this.logger.error('Error initializing board:', error);
      throw error;
    }
  }

  async getBoard(): Promise<Board> {
    try {
      const boards = await this.boardRepository.find({
        take: 1,
        order: {
          id: 'ASC',
        },
      });
      
      if (boards.length === 0) {
        this.logger.error('No board found');
        throw new Error('Board not found');
      }
      return boards[0];
    } catch (error) {
      this.logger.error('Error getting board:', error);
      throw error;
    }
  }

  async createColumn(title: string): Promise<Column> {
    try {
      this.logger.log(`Creating column with title: ${title}`);
      const board = await this.getBoard();
      
      const column = this.columnRepository.create({
        title,
        board,
        cards: [],
      });
      
      await this.columnRepository.save(column);
      this.logger.log(`Column created successfully with ID: ${column.id}`);
      
      return column;
    } catch (error) {
      this.logger.error('Error creating column:', error);
      throw error;
    }
  }

  async createCard(columnId: string, title: string, description: string): Promise<Card> {
    try {
      this.logger.log(`Creating card in column ${columnId} with title: ${title}`);
      const column = await this.columnRepository.findOne({
        where: { id: columnId },
        relations: ['board'], // Ensure we have the board reference
      });
      
      if (!column) {
        this.logger.error(`Column not found with ID: ${columnId}`);
        throw new Error('Column not found');
      }
      
      const card = this.cardRepository.create({
        title,
        description,
        column,
      });
      
      await this.cardRepository.save(card);
      this.logger.log(`Card created successfully with ID: ${card.id}`);
      
      return card;
    } catch (error) {
      this.logger.error('Error creating card:', error);
      throw error;
    }
  }

  async deleteColumn(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting column with ID: ${id}`);
      const column = await this.columnRepository.findOne({
        where: { id },
        relations: ['cards'], // Ensure we delete associated cards
      });

      if (!column) {
        this.logger.error(`Column not found with ID: ${id}`);
        throw new Error('Column not found');
      }

      // First delete all cards in the column
      if (column.cards) {
        await this.cardRepository.remove(column.cards);
      }

      // Then delete the column
      await this.columnRepository.remove(column);
      this.logger.log(`Column deleted successfully`);
    } catch (error) {
      this.logger.error('Error deleting column:', error);
      throw error;
    }
  }

  async deleteCard(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting card with ID: ${id}`);
      const card = await this.cardRepository.findOne({
        where: { id },
      });

      if (!card) {
        this.logger.error(`Card not found with ID: ${id}`);
        throw new Error('Card not found');
      }

      await this.cardRepository.remove(card);
      this.logger.log(`Card deleted successfully`);
    } catch (error) {
      this.logger.error('Error deleting card:', error);
      throw error;
    }
  }

  async moveCard(cardId: string, targetColumnId: string, newOrder: number): Promise<Card> {
    try {
      this.logger.log(`Moving card ${cardId} to column ${targetColumnId} with order ${newOrder}`);
      
      const card = await this.cardRepository.findOne({
        where: { id: cardId },
        relations: ['column'],
      });

      if (!card) {
        throw new Error('Card not found');
      }

      const targetColumn = await this.columnRepository.findOne({
        where: { id: targetColumnId },
      });

      if (!targetColumn) {
        throw new Error('Target column not found');
      }

      // Update the card's column and order
      card.column = targetColumn;
      card.order = newOrder;

      // Save the updated card
      const updatedCard = await this.cardRepository.save(card);
      this.logger.log(`Card moved successfully`);

      return updatedCard;
    } catch (error) {
      this.logger.error('Error moving card:', error);
      throw error;
    }
  }
}
