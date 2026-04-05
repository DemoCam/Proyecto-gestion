import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';

export type UserDocument = User & Document;

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role', required: true })
  roleId: Role;

  @Prop()
  documentNumber: string;

  @Prop()
  phone: string;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop()
  lastLoginAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  updatedBy: User;
}

export const UserSchema = SchemaFactory.createForClass(User);
