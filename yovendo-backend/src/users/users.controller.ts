import { Controller, Get, Post, Put, Body, Param, UseGuards, SetMetadata } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserStatus } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

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

  @Post()
  async create(@Body() createDto: any) {
    return this.usersService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.usersService.update(id, updateDto);
  }

  @Put(':id/status')
  async setStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
    return this.usersService.setStatus(id, status);
  }
}
