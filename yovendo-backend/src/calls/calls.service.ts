import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomersService } from '../customers/customers.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, RelatedEntityType } from '../notifications/schemas/notification.schema';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { Call, CallDocument } from './schemas/call.schema';

@Injectable()
export class CallsService {
  constructor(
    @InjectModel(Call.name) private callModel: Model<CallDocument>,
    private readonly customersService: CustomersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateCallDto, consultantId: string) {
    await this.customersService.findOneForConsultant(dto.customerId, consultantId);

    const call = await new this.callModel({
      ...dto,
      date: new Date(dto.date),
      nextFollowUpDate: dto.nextFollowUpDate ? new Date(dto.nextFollowUpDate) : undefined,
      consultantId,
    }).save();

    await this.notificationsService.create({
      title: 'Llamada registrada',
      message: `Se registró una llamada con resultado: ${call.result}.`,
      type: NotificationType.CALL,
      targetUserId: consultantId,
      relatedEntityType: RelatedEntityType.CALL,
      relatedEntityId: call._id.toString(),
    });

    await this.notificationsService.create({
      title: 'Actividad de llamada registrada',
      message: `Un consultor registró una llamada con resultado: ${call.result}.`,
      type: NotificationType.CALL,
      targetRole: 'DIRECTOR',
      relatedEntityType: RelatedEntityType.CALL,
      relatedEntityId: call._id.toString(),
    });

    return call;
  }

  async findMine(consultantId: string) {
    return this.callModel
      .find({ consultantId: new Types.ObjectId(consultantId) })
      .populate('customerId', 'fullName phone email status')
      .sort({ date: -1 })
      .exec();
  }

  async findOneForConsultant(id: string, consultantId: string) {
    const call = await this.callModel.findById(id).exec();
    if (!call) {
      throw new NotFoundException('Call not found');
    }
    if (call.consultantId.toString() !== consultantId) {
      throw new ForbiddenException('You cannot access this call');
    }
    return call;
  }

  async update(id: string, dto: UpdateCallDto, consultantId: string) {
    await this.findOneForConsultant(id, consultantId);
    const updateData = {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
      nextFollowUpDate: dto.nextFollowUpDate ? new Date(dto.nextFollowUpDate) : undefined,
    };
    return this.callModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async summaryForDirector() {
    const total = await this.callModel.countDocuments().exec();
    return { total };
  }
}
