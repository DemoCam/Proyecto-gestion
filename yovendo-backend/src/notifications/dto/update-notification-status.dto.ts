import { IsBoolean } from 'class-validator';

export class UpdateNotificationStatusDto {
  @IsBoolean()
  isRead: boolean;
}
