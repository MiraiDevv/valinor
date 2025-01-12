import { User } from './user.model';

export interface Activity {
  id: string;
  type: ActivityType;
  cardId: string;
  user: User;
  data: Record<string, any>;
  createdAt: Date;
}

export enum ActivityType {
  CARD_CREATED = 'CARD_CREATED',
  CARD_UPDATED = 'CARD_UPDATED',
  CARD_MOVED = 'CARD_MOVED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMMENT_UPDATED = 'COMMENT_UPDATED',
  COMMENT_DELETED = 'COMMENT_DELETED',
  MEMBER_ADDED = 'MEMBER_ADDED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  LABEL_ADDED = 'LABEL_ADDED',
  LABEL_REMOVED = 'LABEL_REMOVED'
} 