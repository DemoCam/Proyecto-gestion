import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetMetadata } from '@nestjs/common';

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
  async createItem(@Body() dto: any, @Request() req) { 
    return this.inventoryService.createItem(dto, req.user.userId); 
  }

  @Put('items/:id')
  async updateItem(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.inventoryService.updateItem(id, dto, req.user.userId);
  }

  @Get('items/:id/movements')
  async getMovements(@Param('id') id: string) {
    return this.inventoryService.getMovements(id);
  }

  @Post('movements')
  async recordMovement(@Body() dto: any, @Request() req) {
    return this.inventoryService.recordMovement(dto.itemId, dto, req.user.userId);
  }
}
