import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwrod: string;

  @Prop({ default: 'user' })
  role: 'user' | 'admin';
}

export const UserSchema = SchemaFactory.createForClass(User);
