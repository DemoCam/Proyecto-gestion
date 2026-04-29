import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    return new this.notificationModel(dto).save();
  }

  async findForUser(userId: string, role: string) {
    const userObjectId = new Types.ObjectId(userId);
    const notifications = await this.notificationModel
      .find({
        $or: [{ targetUserId: userObjectId }, { targetRole: role }],
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return notifications.map((notification) => ({
      ...notification,
      isRead:
        notification.isRead ||
        notification.readByUserIds?.some((readUserId) => readUserId.toString() === userId) ||
        false,
    }));
  }

  async markAsRead(id: string, userId: string, role: string) {
    const notification = await this.notificationModel.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const isTargetUser = notification.targetUserId?.toString() === userId;
    const isTargetRole = notification.targetRole === role;
    if (!isTargetUser && !isTargetRole) {
      throw new ForbiddenException('You cannot update this notification');
    }

    if (isTargetUser) {
      notification.isRead = true;
    }

    if (!notification.readByUserIds.some((readUserId) => readUserId.toString() === userId)) {
      notification.readByUserIds.push(new Types.ObjectId(userId));
    }

    return notification.save();
  }

  async markAllAsRead(userId: string, role: string) {
    const notifications = await this.notificationModel
      .find({
        $or: [{ targetUserId: new Types.ObjectId(userId) }, { targetRole: role }],
      })
      .exec();

    await Promise.all(
      notifications.map((notification) => {
        if (notification.targetUserId?.toString() === userId) {
          notification.isRead = true;
        }

        if (!notification.readByUserIds.some((readUserId) => readUserId.toString() === userId)) {
          notification.readByUserIds.push(new Types.ObjectId(userId));
        }

        return notification.save();
      }),
    );

    return { updated: notifications.length };
  }
}
