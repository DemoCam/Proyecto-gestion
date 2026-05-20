import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CallsService } from '../calls/calls.service';
import { CustomersService } from '../customers/customers.service';
import { InventoryService } from '../inventory/inventory.service';
import { MovementType } from '../inventory/schemas/inventory-movement.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, RelatedEntityType } from '../notifications/schemas/notification.schema';
import { UsersService } from '../users/users.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale, SaleDocument, SaleStatus } from './schemas/sale.schema';

const MONTHLY_GOAL = 1000000;
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    private readonly customersService: CustomersService,
    private readonly inventoryService: InventoryService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly callsService: CallsService,
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

  async dashboardForDirector() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);

    const notCancelled = { status: { $ne: SaleStatus.CANCELLED } };

    const periodTotals = async (from: Date) => {
      const rows = await this.saleModel.aggregate<{ count: number; amount: number }>([
        { $match: { ...notCancelled, saleDate: { $gte: from } } },
        { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
      ]);
      return { count: rows[0]?.count ?? 0, amount: rows[0]?.amount ?? 0 };
    };

    const [
      today,
      month,
      year,
      trendRows,
      salesByConsultant,
      monthByConsultant,
      consultants,
      customerCounts,
      callsSummary,
    ] = await Promise.all([
      periodTotals(startOfToday),
      periodTotals(startOfMonth),
      periodTotals(startOfYear),
      this.saleModel.aggregate<{ _id: number; amount: number; count: number }>([
        { $match: { ...notCancelled, saleDate: { $gte: startOfYear, $lt: startOfNextYear } } },
        { $group: { _id: { $month: '$saleDate' }, amount: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      this.saleModel.aggregate<{ _id: any; salesCount: number; totalAmount: number }>([
        { $match: notCancelled },
        { $group: { _id: '$consultantId', salesCount: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } },
      ]),
      this.saleModel.aggregate<{ _id: any; amount: number }>([
        { $match: { ...notCancelled, saleDate: { $gte: startOfMonth } } },
        { $group: { _id: '$consultantId', amount: { $sum: '$totalAmount' } } },
      ]),
      this.usersService.findConsultants(),
      this.customersService.countsByConsultant(),
      this.callsService.summaryForDirector(),
    ]);

    const trendMap = new Map(trendRows.map((row) => [row._id, row]));
    const monthlyTrend = MONTH_LABELS.map((label, index) => {
      const monthNumber = index + 1;
      const row = trendMap.get(monthNumber);
      return { month: monthNumber, label, amount: row?.amount ?? 0, count: row?.count ?? 0 };
    });

    const salesMap = new Map(salesByConsultant.map((row) => [row._id?.toString(), row]));
    const monthMap = new Map(monthByConsultant.map((row) => [row._id?.toString(), row.amount]));
    const customerMap = new Map(customerCounts.map((row) => [row.consultantId, row]));

    const ranking = consultants
      .map((consultant) => {
        const sales = salesMap.get(consultant.id);
        const customers = customerMap.get(consultant.id);
        const monthAmount = monthMap.get(consultant.id) ?? 0;
        return {
          consultantId: consultant.id,
          name: `${consultant.firstName} ${consultant.lastName}`.trim(),
          status: consultant.status,
          salesCount: sales?.salesCount ?? 0,
          totalAmount: sales?.totalAmount ?? 0,
          monthAmount,
          customers: customers?.total ?? 0,
          won: customers?.won ?? 0,
          goal: MONTHLY_GOAL,
          goalProgress: MONTHLY_GOAL > 0 ? monthAmount / MONTHLY_GOAL : 0,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .map((row, index) => ({ ...row, rank: index + 1, isTop: index < 3 }));

    const salesTotals = salesByConsultant.reduce(
      (acc, row) => {
        acc.count += row.salesCount;
        acc.amount += row.totalAmount;
        return acc;
      },
      { count: 0, amount: 0 },
    );

    const customersTotals = customerCounts.reduce(
      (acc, row) => {
        acc.total += row.total;
        acc.inFollowUp += row.inFollowUp;
        return acc;
      },
      { total: 0, inFollowUp: 0 },
    );

    return {
      periods: { today, month, year },
      monthlyTrend,
      ranking,
      totals: {
        consultants: consultants.length,
        customers: customersTotals.total,
        inFollowUp: customersTotals.inFollowUp,
        calls: callsSummary.total,
        sales: salesTotals.count,
        salesAmount: salesTotals.amount,
      },
      meta: { monthlyGoal: MONTHLY_GOAL, year: now.getFullYear() },
    };
  }
}
