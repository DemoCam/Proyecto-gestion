import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  INFO = 'INFO',
  USER = 'USER',
  INVENTORY = 'INVENTORY',
  CUSTOMER = 'CUSTOMER',
  CALL = 'CALL',
  SALE = 'SALE',
  WARNING = 'WARNING',
}

export enum RelatedEntityType {
  USER = 'USER',
  INVENTORY_ITEM = 'INVENTORY_ITEM',
  INVENTORY_MOVEMENT = 'INVENTORY_MOVEMENT',
  CUSTOMER = 'CUSTOMER',
  CALL = 'CALL',
  SALE = 'SALE',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: NotificationType, default: NotificationType.INFO })
  type: NotificationType;

  @Prop()
  targetRole?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  targetUserId?: Types.ObjectId;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  readByUserIds: Types.ObjectId[];

  @Prop({ type: String, enum: RelatedEntityType })
  relatedEntityType?: RelatedEntityType;

  @Prop()
  relatedEntityId?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
