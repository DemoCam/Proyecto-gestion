import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { CustomersService } from '../customers/customers.service';
import { CustomerStatus } from '../customers/schemas/customer.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, RelatedEntityType } from '../notifications/schemas/notification.schema';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { Call, CallDocument, CallStatus } from './schemas/call.schema';

const CLOSED_CUSTOMER_STATUSES = [CustomerStatus.WON, CustomerStatus.LOST, CustomerStatus.INACTIVE];

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

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
    const updateData: Record<string, unknown> = {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
      nextFollowUpDate: dto.nextFollowUpDate ? new Date(dto.nextFollowUpDate) : undefined,
    };
    // Si se reprograma el seguimiento, se vuelve a habilitar el recordatorio.
    if (dto.nextFollowUpDate) {
      updateData.reminderSentAt = null;
    }
    return this.callModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async summaryForDirector() {
    const total = await this.callModel.countDocuments().exec();
    return { total };
  }

  async findDueFollowUps(consultantId: string) {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return this.callModel
      .find({
        consultantId: new Types.ObjectId(consultantId),
        status: CallStatus.PENDING_FOLLOW_UP,
        nextFollowUpDate: { $ne: null, $lte: endOfToday },
      })
      .populate('customerId', 'fullName phone email status')
      .sort({ nextFollowUpDate: 1 })
      .exec();
  }

  async boardForConsultant(consultantId: string) {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [customers, pendingCalls] = await Promise.all([
      this.customersService.findByConsultant(consultantId),
      this.callModel
        .find({
          consultantId: new Types.ObjectId(consultantId),
          status: CallStatus.PENDING_FOLLOW_UP,
          nextFollowUpDate: { $ne: null },
        })
        .sort({ nextFollowUpDate: 1 })
        .exec(),
    ]);

    const nextByCustomer = new Map<string, Date>();
    for (const call of pendingCalls) {
      const key = call.customerId.toString();
      if (!nextByCustomer.has(key) && call.nextFollowUpDate) {
        nextByCustomer.set(key, call.nextFollowUpDate);
      }
    }

    return customers.map((customer) => {
      const nextFollowUpDate = nextByCustomer.get(customer._id.toString()) ?? null;
      const isOpen = !CLOSED_CUSTOMER_STATUSES.includes(customer.status);
      const overdue = Boolean(isOpen && nextFollowUpDate && nextFollowUpDate <= endOfToday);

      return {
        _id: customer._id,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        source: customer.source,
        notes: customer.notes,
        status: customer.status,
        nextFollowUpDate,
        overdue,
      };
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async runFollowUpReminders() {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const dueCalls = await this.callModel
      .find({
        status: CallStatus.PENDING_FOLLOW_UP,
        nextFollowUpDate: { $ne: null, $lte: endOfToday },
        reminderSentAt: null,
      })
      .populate('customerId', 'fullName')
      .exec();

    for (const call of dueCalls) {
      const customer = call.customerId as unknown as { fullName?: string } | null;
      const customerName = customer?.fullName ?? 'un cliente';

      await this.notificationsService.create({
        title: 'Seguimiento pendiente',
        message: `Tienes un seguimiento programado con ${customerName}. Contacta al cliente para mantener la relacion.`,
        type: NotificationType.CALL,
        targetUserId: call.consultantId.toString(),
        relatedEntityType: RelatedEntityType.CALL,
        relatedEntityId: call._id.toString(),
      });

      call.reminderSentAt = new Date();
      await call.save();
    }

    this.logger.log(`Recordatorios de seguimiento enviados: ${dueCalls.length}`);
    return { reminders: dueCalls.length };
  }
}
