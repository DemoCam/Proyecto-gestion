import { Body, Controller, Get, Param, Post, Put, Request, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersService } from './customers.service';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles('CONSULTOR')
  async findMine(@Request() req) {
    return this.customersService.findMine(req.user.userId);
  }

  @Get('summary/director')
  @Roles('DIRECTOR')
  async summaryForDirector() {
    return this.customersService.summaryForDirector();
  }

  @Get(':id')
  @Roles('CONSULTOR')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.customersService.findOneForConsultant(id, req.user.userId);
  }

  @Post()
  @Roles('CONSULTOR')
  async create(@Body() dto: CreateCustomerDto, @Request() req) {
    return this.customersService.create(dto, req.user.userId);
  }

  @Put(':id')
  @Roles('CONSULTOR')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto, @Request() req) {
    return this.customersService.update(id, dto, req.user.userId);
  }
}
