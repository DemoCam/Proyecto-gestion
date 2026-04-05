import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryCategory, InventoryCategoryDocument } from './schemas/inventory-category.schema';
import { InventoryItem, InventoryItemDocument, ItemStatus } from './schemas/inventory-item.schema';
import { InventoryMovement, InventoryMovementDocument, MovementType } from './schemas/inventory-movement.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryCategory.name) private categoryModel: Model<InventoryCategoryDocument>,
    @InjectModel(InventoryItem.name) private itemModel: Model<InventoryItemDocument>,
    @InjectModel(InventoryMovement.name) private movementModel: Model<InventoryMovementDocument>,
  ) {}

  // CATEGORIES
  async getCategories() {
    return this.categoryModel.find().exec();
  }
  async createCategory(dto: any) {
    return new this.categoryModel(dto).save();
  }

  // ITEMS
  async getItems() {
    return this.itemModel.find().populate('categoryId').exec();
  }
  async createItem(dto: any, userId: string) {
    return new this.itemModel({ ...dto, createdBy: userId }).save();
  }
  async updateItem(id: string, dto: any, userId: string) {
    return this.itemModel.findByIdAndUpdate(id, { ...dto, updatedBy: userId }, { new: true }).exec();
  }

  // MOVEMENTS
  async recordMovement(itemId: string, dto: any, userId: string) {
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
    return movement.save();
  }

  async getMovements(itemId: string) {
    return this.movementModel.find({ itemId: itemId as any }).populate('performedBy', 'firstName lastName').sort({ createdAt: -1 }).exec();
  }
}
