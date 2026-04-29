import { Body, Controller, Get, Param, Patch, Post, Request, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  async findMine(@Request() req) {
    return this.notificationsService.findForUser(req.user.userId, req.user.role);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.userId, req.user.role);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.userId, req.user.role);
  }

  @Post()
  @Roles('ADMIN', 'SUPERVISOR', 'DIRECTOR')
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }
}
