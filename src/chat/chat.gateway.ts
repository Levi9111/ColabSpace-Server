import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token as string;

      const user = this.jwtService.verify<{ userId: string; email: string }>(
        token,
      );

      (client.data as { user?: any }).user = user;

      console.log('User connected', user.email);
    } catch (error) {
      console.log('Socket connection rejected', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(
      'User Disconnected',
      (client.data as { user?: any }).user?.email,
    );
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
