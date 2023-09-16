// socket.gateway.ts

import { CommunityMessageType } from '@app/common/type/message.type';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chatMessage')
  handleMessage(
    @MessageBody() data: CommunityMessageType,
    @ConnectedSocket() client: Socket,
  ) {
    // Handle and broadcast the chat message
    console.log(data);
    this.server.emit('chatMessage', data);
  }
  @SubscribeMessage('DirectMessage')
  handleDirectMessage(
    @MessageBody() data: CommunityMessageType,
    @ConnectedSocket() client: Socket,
  ) {
    // Handle and broadcast the chat message
    console.log(data);
    this.server.emit('DirectMessage', data);
  }
}
