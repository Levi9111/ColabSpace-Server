import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' })
  role: 'user' | 'admin';

  @Prop({ type: String, default: null, sparse: true })
  otp: string | null;

  @Prop({ type: String, default: null, sparse: true })
  otpExpiresAt: string;

  @Prop({ default: false })
  isAuthenticated: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
