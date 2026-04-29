import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserStatus } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, RelatedEntityType } from '../notifications/schemas/notification.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createDto: CreateUserDto): Promise<User> {
    const existing = await this.userModel.findOne({ email: createDto.email });
    if (existing) throw new BadRequestException('Email already in use');
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createDto.password, salt);
    
    const newUser = new this.userModel({
      ...createDto,
      passwordHash,
    });
    const savedUser = await newUser.save();
    await this.notificationsService.create({
      title: 'Usuario creado',
      message: `Se creó el usuario ${savedUser.firstName} ${savedUser.lastName}.`,
      type: NotificationType.USER,
      targetRole: 'ADMIN',
      relatedEntityType: RelatedEntityType.USER,
      relatedEntityId: savedUser._id.toString(),
    });
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('roleId').exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).populate('roleId').exec();
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<User | null> {
    const updateData: UpdateUserDto & { passwordHash?: string } = { ...updateDto };

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
      delete updateData.password;
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (updatedUser) {
      await this.notificationsService.create({
        title: 'Usuario actualizado',
        message: `Se actualizó el usuario ${updatedUser.firstName} ${updatedUser.lastName}.`,
        type: NotificationType.USER,
        targetRole: 'ADMIN',
        relatedEntityType: RelatedEntityType.USER,
        relatedEntityId: updatedUser._id.toString(),
      });
    }
    return updatedUser;
  }

  async setStatus(id: string, status: UserStatus): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async countConsultants(): Promise<{ total: number }> {
    const users = await this.userModel.find().populate('roleId').exec();
    return { total: users.filter((user) => user.roleId?.name === 'CONSULTOR').length };
  }
}
