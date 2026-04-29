import { Controller, Get, Post, Put, Body, Param, UseGuards, SetMetadata } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserStatus } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
@Roles('ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('consultants/count')
  @Roles('DIRECTOR')
  async countConsultants() {
    return this.usersService.countConsultants();
  }

  @Post()
  async create(@Body() createDto: CreateUserDto) {
    return this.usersService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    return this.usersService.update(id, updateDto);
  }

  @Put(':id/status')
  async setStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.usersService.setStatus(id, dto.status);
  }
}
