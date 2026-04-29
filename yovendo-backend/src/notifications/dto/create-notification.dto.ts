import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { NotificationType, RelatedEntityType } from '../schemas/notification.schema';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsString()
  @IsOptional()
  targetRole?: string;

  @ValidateIf((dto: CreateNotificationDto) => !dto.targetRole)
  @IsMongoId()
  @IsOptional()
  targetUserId?: string;

  @IsEnum(RelatedEntityType)
  @IsOptional()
  relatedEntityType?: RelatedEntityType;

  @IsString()
  @IsOptional()
  relatedEntityId?: string;
}
