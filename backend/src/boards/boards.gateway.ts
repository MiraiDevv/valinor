import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway({ path: '/ws' })
export class BoardsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: WebSocket) {
    console.log('Client connected');
  }

  handleDisconnect(client: WebSocket) {
    console.log('Client disconnected');
  }

  @SubscribeMessage('joinBoard')
  handleJoinBoard(client: WebSocket, data: { boardId: string }) {
    console.log(`Client joined board: ${data.boardId}`);
  }

  @SubscribeMessage('leaveBoard')
  handleLeaveBoard(client: WebSocket, data: { boardId: string }) {
    console.log(`Client left board: ${data.boardId}`);
  }
} 