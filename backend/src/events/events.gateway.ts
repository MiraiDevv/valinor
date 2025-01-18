import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UnauthorizedException, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true
  },
  namespace: '/boards',
  transports: ['websocket', 'polling']
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException();
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException();
      }

      client.data.user = user;
      client.join(`user_${user.id}`);
      this.logger.log(`Client connected: ${client.id}, User: ${user.id}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
      return false;
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    client.disconnect();
  }

  @SubscribeMessage('joinBoard')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    const boardId = data.boardId;
    this.logger.log(`Client ${client.id} joining board ${boardId}`);
    client.join(`board_${boardId}`);
    return { event: 'joinedBoard', data: boardId };
  }

  @SubscribeMessage('leaveBoard')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    const boardId = data.boardId;
    this.logger.log(`Client ${client.id} leaving board ${boardId}`);
    client.leave(`board_${boardId}`);
    return { event: 'leftBoard', data: boardId };
  }

  // Board events
  notifyBoardUpdate(boardId: string, data: any) {
    this.logger.debug(`Notifying board update for ${boardId}`);
    this.server.to(`board_${boardId}`).emit('board.updated', { type: 'board.updated', data });
  }

  notifyColumnCreated(boardId: string, data: any) {
    this.logger.debug(`Notifying column created for board ${boardId}`);
    this.server.to(`board_${boardId}`).emit('column.created', { type: 'column.created', data });
  }

  notifyColumnUpdated(boardId: string, data: any) {
    this.logger.debug(`Notifying column updated for board ${boardId}`);
    this.server.to(`board_${boardId}`).emit('column.updated', { type: 'column.updated', data });
  }

  notifyColumnDeleted(boardId: string, data: any) {
    this.logger.debug(`Notifying column deleted for board ${boardId}`);
    this.server.to(`board_${boardId}`).emit('column.deleted', { type: 'column.deleted', data });
  }

  // Card events
  notifyCardCreated(boardId: string, data: any) {
    this.logger.debug(`Notifying card created for board ${boardId}`);
    this.server.to(`board_${boardId}`).emit('card.created', { type: 'card.created', data });
  }

  notifyCardUpdated(boardId: string, data: any) {
    this.logger.debug(`Notifying card updated for board ${boardId}`);
    this.server.to(`board_${boardId}`).emit('card.updated', { type: 'card.updated', data });
  }

  notifyCardDeleted(boardId: string, data: any) {
    this.logger.debug(`Notifying card deleted for board ${boardId}`);
    this.server.to(`board_${boardId}`).emit('card.deleted', { type: 'card.deleted', data });
  }
} 