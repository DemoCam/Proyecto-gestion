import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryCategory, InventoryCategoryDocument } from './schemas/inventory-category.schema';
import { InventoryItem, InventoryItemDocument, ItemStatus } from './schemas/inventory-item.schema';
import { InventoryMovement, InventoryMovementDocument, MovementType } from './schemas/inventory-movement.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, RelatedEntityType } from '../notifications/schemas/notification.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { RecordMovementDto } from './dto/record-movement.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryCategory.name) private categoryModel: Model<InventoryCategoryDocument>,
    @InjectModel(InventoryItem.name) private itemModel: Model<InventoryItemDocument>,
    @InjectModel(InventoryMovement.name) private movementModel: Model<InventoryMovementDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // CATEGORIES
  async getCategories() {
    return this.categoryModel.find().exec();
  }
  async createCategory(dto: CreateCategoryDto) {
    return new this.categoryModel(dto).save();
  }

  // ITEMS
  async getItems() {
    return this.itemModel.find().populate('categoryId').exec();
  }

  async findItemById(id: string) {
    const item = await this.itemModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }
  async createItem(dto: CreateItemDto, userId: string) {
    const item = await new this.itemModel({ ...dto, createdBy: userId }).save();
    if (item.currentStock <= item.minimumStock) {
      await this.notifyLowStock(item);
    }
    return item;
  }
  async updateItem(id: string, dto: UpdateItemDto, userId: string) {
    const item = await this.itemModel.findByIdAndUpdate(id, { ...dto, updatedBy: userId }, { new: true }).exec();
    if (item && item.currentStock <= item.minimumStock) {
      await this.notifyLowStock(item);
    }
    return item;
  }

  // MOVEMENTS
  async recordMovement(itemId: string, dto: RecordMovementDto, userId: string) {
    const item = await this.itemModel.findById(itemId);
    if (!item) throw new NotFoundException('Item not found');

    const previousStock = item.currentStock;
    let newStock = previousStock;

    if (dto.type === MovementType.ENTRY) {
      newStock += dto.quantity;
    } else if (dto.type === MovementType.EXIT) {
      newStock -= dto.quantity;
    } else if (dto.type === MovementType.ADJUSTMENT) {
      // For adjustments, dto.quantity is the exact new stock level (based on exact physical count)
      newStock = dto.quantity;
    }

    if (newStock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    // Update the item
    item.currentStock = newStock;
    await item.save();

    // Record the movement
    const movementQuantity = dto.type === MovementType.ADJUSTMENT ? Math.abs(newStock - previousStock) : dto.quantity;
    const movement = new this.movementModel({
      itemId: item._id,
      type: dto.type,
      quantity: movementQuantity,
      previousStock,
      newStock,
      reason: dto.reason,
      reference: dto.reference,
      performedBy: userId
    });
    const savedMovement = await movement.save();

    await this.notificationsService.create({
      title: 'Movimiento de inventario',
      message: `Se registró un movimiento ${dto.type} para ${item.name}.`,
      type: NotificationType.INVENTORY,
      targetRole: 'SUPERVISOR',
      relatedEntityType: RelatedEntityType.INVENTORY_MOVEMENT,
      relatedEntityId: savedMovement._id.toString(),
    });

    if (item.currentStock <= item.minimumStock) {
      await this.notifyLowStock(item);
    }

    return savedMovement;
  }

  async getMovements(itemId: string) {
    return this.movementModel.find({ itemId }).populate('performedBy', 'firstName lastName').sort({ createdAt: -1 }).exec();
  }

  private async notifyLowStock(item: InventoryItemDocument) {
    await this.notificationsService.create({
      title: 'Stock bajo',
      message: `${item.name} está en ${item.currentStock} ${item.unit}; mínimo definido: ${item.minimumStock}.`,
      type: NotificationType.WARNING,
      targetRole: 'SUPERVISOR',
      relatedEntityType: RelatedEntityType.INVENTORY_ITEM,
      relatedEntityId: item._id.toString(),
    });
  }
}
