import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { RecordMovementDto } from './dto/record-movement.dto';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
@Roles('SUPERVISOR')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('categories')
  async getCategories() { return this.inventoryService.getCategories(); }

  @Post('categories')
  async createCategory(@Body() dto: any) { return this.inventoryService.createCategory(dto); }

  @Get('items')
  async getItems() { return this.inventoryService.getItems(); }

  @Post('items')
  async createItem(@Body() dto: CreateItemDto, @Request() req) {
    return this.inventoryService.createItem(dto, req.user.userId);
  }

  @Put('items/:id')
  async updateItem(@Param('id') id: string, @Body() dto: UpdateItemDto, @Request() req) {
    return this.inventoryService.updateItem(id, dto, req.user.userId);
  }

  @Get('items/:id/movements')
  async getMovements(@Param('id') id: string) {
    return this.inventoryService.getMovements(id);
  }

  @Post('movements')
  async recordMovement(@Body() dto: RecordMovementDto, @Request() req) {
    return this.inventoryService.recordMovement(dto.itemId, dto, req.user.userId);
  }
}
