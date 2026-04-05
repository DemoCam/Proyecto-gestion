import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { InventoryCategory } from './inventory-category.schema';

export type InventoryItemDocument = InventoryItem & Document;

export enum ItemStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'InventoryCategory', required: true })
  categoryId: InventoryCategory;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true, default: 0 })
  currentStock: number;

  @Prop({ required: true, default: 0 })
  minimumStock: number;

  @Prop()
  maximumStock: number;

  @Prop()
  costPrice: number;

  @Prop()
  salePrice: number;

  @Prop({ type: String, enum: ItemStatus, default: ItemStatus.ACTIVE })
  status: ItemStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  updatedBy: User;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
