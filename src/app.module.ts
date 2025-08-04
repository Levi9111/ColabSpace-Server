import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [UsersModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_CONNECTION_URI')!,
      }),
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    UsersModule,
    ChatModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
