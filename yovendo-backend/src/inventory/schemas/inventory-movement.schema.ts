import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { InventoryItem } from './inventory-item.schema';
import { User } from '../../users/schemas/user.schema';

export type InventoryMovementDocument = InventoryMovement & Document;

export enum MovementType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Schema({ timestamps: true })
export class InventoryMovement {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'InventoryItem', required: true })
  itemId: InventoryItem;

  @Prop({ type: String, enum: MovementType, required: true })
  type: MovementType;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  previousStock: number;

  @Prop({ required: true })
  newStock: number;

  @Prop({ required: true })
  reason: string;

  @Prop()
  reference: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  performedBy: User;
}

export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);
