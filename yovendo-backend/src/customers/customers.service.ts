import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, RelatedEntityType } from '../notifications/schemas/notification.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, CustomerDocument, CustomerStatus } from './schemas/customer.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateCustomerDto, consultantId: string) {
    const customer = await new this.customerModel({
      ...dto,
      assignedConsultantId: consultantId,
    }).save();

    await this.notificationsService.create({
      title: 'Cliente registrado',
      message: `Se registró el cliente ${customer.fullName}.`,
      type: NotificationType.CUSTOMER,
      targetUserId: consultantId,
      relatedEntityType: RelatedEntityType.CUSTOMER,
      relatedEntityId: customer._id.toString(),
    });

    await this.notificationsService.create({
      title: 'Nuevo cliente en seguimiento',
      message: `Un consultor registró el cliente ${customer.fullName}.`,
      type: NotificationType.CUSTOMER,
      targetRole: 'DIRECTOR',
      relatedEntityType: RelatedEntityType.CUSTOMER,
      relatedEntityId: customer._id.toString(),
    });

    return customer;
  }

  async findMine(consultantId: string) {
    return this.customerModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOneForConsultant(id: string, consultantId: string) {
    const customer = await this.customerModel.findById(id).exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto, consultantId: string) {
    await this.findOneForConsultant(id, consultantId);
    return this.customerModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async summaryForDirector() {
    const [total, inFollowUp] = await Promise.all([
      this.customerModel.countDocuments().exec(),
      this.customerModel.countDocuments({ status: CustomerStatus.IN_FOLLOW_UP }).exec(),
    ]);

    return { total, inFollowUp };
  }
}
