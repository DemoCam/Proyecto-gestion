import { Body, Controller, Get, Param, Post, Put, Request, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CallsService } from './calls.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get()
  @Roles('CONSULTOR')
  async findMine(@Request() req) {
    return this.callsService.findMine(req.user.userId);
  }

  @Get('summary/director')
  @Roles('DIRECTOR')
  async summaryForDirector() {
    return this.callsService.summaryForDirector();
  }

  @Get(':id')
  @Roles('CONSULTOR')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.callsService.findOneForConsultant(id, req.user.userId);
  }

  @Post()
  @Roles('CONSULTOR')
  async create(@Body() dto: CreateCallDto, @Request() req) {
    return this.callsService.create(dto, req.user.userId);
  }

  @Put(':id')
  @Roles('CONSULTOR')
  async update(@Param('id') id: string, @Body() dto: UpdateCallDto, @Request() req) {
    return this.callsService.update(id, dto, req.user.userId);
  }
}
