import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type SaleDocument = Sale & Document;

export enum SaleStatus {
  REGISTERED = 'REGISTERED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Schema({ _id: false })
export class SaleItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'InventoryItem' })
  inventoryItemId?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true, default: 0 })
  unitPrice: number;
}

export const SaleItemSchema = SchemaFactory.createForClass(SaleItem);

@Schema({ timestamps: true })
export class Sale {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  consultantId: Types.ObjectId;

  @Prop({ type: [SaleItemSchema], default: [] })
  items: SaleItem[];

  @Prop({ required: true, default: 0 })
  totalAmount: number;

  @Prop({ type: String, enum: SaleStatus, default: SaleStatus.REGISTERED })
  status: SaleStatus;

  @Prop({ required: true })
  saleDate: Date;

  @Prop()
  notes?: string;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
