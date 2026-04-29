import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

export enum CustomerStatus {
  NEW = 'NEW',
  IN_FOLLOW_UP = 'IN_FOLLOW_UP',
  WON = 'WON',
  LOST = 'LOST',
  INACTIVE = 'INACTIVE',
}

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop()
  source?: string;

  @Prop()
  notes?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  assignedConsultantId: Types.ObjectId;

  @Prop({ type: String, enum: CustomerStatus, default: CustomerStatus.NEW })
  status: CustomerStatus;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
