import { Body, Controller, Get, Param, Post, Put, Request, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SalesService } from './sales.service';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @Roles('CONSULTOR')
  async findMine(@Request() req) {
    return this.salesService.findMine(req.user.userId);
  }

  @Get('summary/director')
  @Roles('DIRECTOR')
  async summaryForDirector() {
    return this.salesService.summaryForDirector();
  }

  @Get(':id')
  @Roles('CONSULTOR')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.salesService.findOneForConsultant(id, req.user.userId);
  }

  @Post()
  @Roles('CONSULTOR')
  async create(@Body() dto: CreateSaleDto, @Request() req) {
    return this.salesService.create(dto, req.user.userId);
  }

  @Put(':id')
  @Roles('CONSULTOR')
  async update(@Param('id') id: string, @Body() dto: UpdateSaleDto, @Request() req) {
    return this.salesService.update(id, dto, req.user.userId);
  }
}
