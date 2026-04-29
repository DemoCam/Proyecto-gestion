import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomersService } from '../customers/customers.service';
import { InventoryService } from '../inventory/inventory.service';
import { MovementType } from '../inventory/schemas/inventory-movement.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, RelatedEntityType } from '../notifications/schemas/notification.schema';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale, SaleDocument, SaleStatus } from './schemas/sale.schema';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    private readonly customersService: CustomersService,
    private readonly inventoryService: InventoryService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateSaleDto, consultantId: string) {
    await this.customersService.findOneForConsultant(dto.customerId, consultantId);

    const items = await Promise.all(
      (dto.items ?? []).map(async (item) => {
        if (!item.inventoryItemId) {
          return {
            name: item.name || 'Venta comercial',
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? 0,
          };
        }

        const inventoryItem = await this.inventoryService.findItemById(item.inventoryItemId);
        return {
          inventoryItemId: inventoryItem._id,
          name: item.name || inventoryItem.name,
          quantity: item.quantity ?? 1,
          unitPrice: item.unitPrice ?? inventoryItem.salePrice ?? 0,
        };
      }),
    );

    const sale = new this.saleModel({
      ...dto,
      items,
      consultantId,
      saleDate: new Date(dto.saleDate),
    });

    if (sale.status !== SaleStatus.CANCELLED) {
      for (const item of items) {
        if (!item.inventoryItemId || item.quantity <= 0) continue;

        await this.inventoryService.recordMovement(
          item.inventoryItemId.toString(),
          {
            itemId: item.inventoryItemId.toString(),
            type: MovementType.EXIT,
            quantity: item.quantity,
            reason: 'Venta registrada por consultor',
            reference: `SALE:${sale._id.toString()}`,
          },
          consultantId,
        );
      }
    }

    await sale.save();

    await this.notificationsService.create({
      title: 'Venta registrada',
      message: `Se registró una venta por $${sale.totalAmount}.`,
      type: NotificationType.SALE,
      targetUserId: consultantId,
      relatedEntityType: RelatedEntityType.SALE,
      relatedEntityId: sale._id.toString(),
    });

    await this.notificationsService.create({
      title: 'Actividad comercial registrada',
      message: 'Un consultor registró una nueva venta para seguimiento.',
      type: NotificationType.SALE,
      targetRole: 'DIRECTOR',
      relatedEntityType: RelatedEntityType.SALE,
      relatedEntityId: sale._id.toString(),
    });

    return sale;
  }

  async findMine(consultantId: string) {
    return this.saleModel
      .find({ consultantId: new Types.ObjectId(consultantId) })
      .populate('customerId', 'fullName phone email status')
      .populate('items.inventoryItemId', 'code name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOneForConsultant(id: string, consultantId: string) {
    const sale = await this.saleModel.findById(id).exec();
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }
    if (sale.consultantId.toString() !== consultantId) {
      throw new ForbiddenException('You cannot access this sale');
    }
    return sale;
  }

  async update(id: string, dto: UpdateSaleDto, consultantId: string) {
    await this.findOneForConsultant(id, consultantId);
    const updateData = {
      ...dto,
      saleDate: dto.saleDate ? new Date(dto.saleDate) : undefined,
    };
    return this.saleModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async summaryForDirector() {
    const [total, amount] = await Promise.all([
      this.saleModel.countDocuments().exec(),
      this.saleModel.aggregate<{ totalAmount: number }>([
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
      ]),
    ]);

    return { total, totalAmount: amount[0]?.totalAmount ?? 0 };
  }
}
