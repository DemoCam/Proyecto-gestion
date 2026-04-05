import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryCategoryDocument = InventoryCategory & Document;

@Schema({ timestamps: true })
export class InventoryCategory {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const InventoryCategorySchema = SchemaFactory.createForClass(InventoryCategory);
