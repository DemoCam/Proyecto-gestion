import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserStatus } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createDto: any): Promise<User> {
    const existing = await this.userModel.findOne({ email: createDto.email });
    if (existing) throw new BadRequestException('Email already in use');
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createDto.password, salt);
    
    const newUser = new this.userModel({
      ...createDto,
      passwordHash,
    });
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('roleId').exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).populate('roleId').exec();
  }

  async update(id: string, updateDto: any): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async setStatus(id: string, status: UserStatus): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }
}
