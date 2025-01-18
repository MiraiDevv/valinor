import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { Attachment } from './entities/attachment.entity';
import { CreateCardDto, UpdateCardDto } from 'shared-types';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
    private eventsGateway: EventsGateway
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const card = this.cardsRepository.create(createCardDto);
    const savedCard = await this.cardsRepository.save(card) as Card;
    
    try {
      const fullCard = await this.findOne(savedCard.id);
      this.eventsGateway.notifyCardCreated(fullCard.column.boardId, savedCard);
    } catch (error) {
      this.logger.warn(`Failed to send WebSocket notification: ${error.message}`);
    }
    
    return savedCard;
  }

  findAll(): Promise<Card[]> {
    return this.cardsRepository.find({
      relations: ['labels', 'assignees', 'column']
    });
  }

  findByColumn(columnId: string): Promise<Card[]> {
    return this.cardsRepository.find({
      where: { columnId },
      relations: ['labels', 'assignees', 'column', 'attachments'],
      order: { order: 'ASC' }
    });
  }

  findOne(id: string): Promise<Card> {
    return this.cardsRepository.findOne({
      where: { id },
      relations: ['labels', 'assignees', 'column', 'attachments']
    });
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    const { attachments, ...cardData } = updateCardDto;

    // Update card data
    await this.cardsRepository.update(id, cardData);

    // Handle attachments if provided
    if (attachments) {
      // Remove existing attachments
      await this.attachmentsRepository.delete({ cardId: id });

      // Create new attachments
      if (attachments.length > 0) {
        const newAttachments = attachments.map(attachment => ({
          ...attachment,
          cardId: id
        }));
        await this.attachmentsRepository.save(newAttachments);
      }
    }

    const updatedCard = await this.cardsRepository.findOne({
      where: { id },
      relations: ['labels', 'assignees', 'column', 'attachments']
    });
    
    try {
      this.eventsGateway.notifyCardUpdated(updatedCard.column.boardId, updatedCard);
    } catch (error) {
      this.logger.warn(`Failed to send WebSocket notification: ${error.message}`);
    }
    
    return updatedCard;
  }

  async remove(id: string): Promise<void> {
    const card = await this.findOne(id);
    await this.cardsRepository.delete(id);
    
    try {
      this.eventsGateway.notifyCardDeleted(card.column.boardId, card);
    } catch (error) {
      this.logger.warn(`Failed to send WebSocket notification: ${error.message}`);
    }
  }

  async reorder(columnId: string, cardIds: string[]): Promise<void> {
    await Promise.all(
      cardIds.map((cardId, index) =>
        this.cardsRepository.update(cardId, { order: index, columnId })
      )
    );
    const updatedCards = await this.findByColumn(columnId);
    
    try {
      if (updatedCards.length > 0) {
        const boardId = updatedCards[0].column.boardId;
        this.eventsGateway.notifyColumnUpdated(boardId, { cards: updatedCards });
      }
    } catch (error) {
      this.logger.warn(`Failed to send WebSocket notification: ${error.message}`);
    }
  }
} 