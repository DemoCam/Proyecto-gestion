import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CallDocument = Call & Document;

export enum CallStatus {
  COMPLETED = 'COMPLETED',
  PENDING_FOLLOW_UP = 'PENDING_FOLLOW_UP',
  NO_ANSWER = 'NO_ANSWER',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Call {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  consultantId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  result: string;

  @Prop()
  notes?: string;

  @Prop()
  nextFollowUpDate?: Date;

  @Prop({ type: String, enum: CallStatus, default: CallStatus.COMPLETED })
  status: CallStatus;
}

export const CallSchema = SchemaFactory.createForClass(Call);
