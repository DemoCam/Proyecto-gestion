import { IsString, IsOptional, IsNumber, IsEnum, IsMongoId } from 'class-validator';
import { ItemStatus } from '../schemas/inventory-item.schema';

export class UpdateItemDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  currentStock?: number;

  @IsNumber()
  @IsOptional()
  minimumStock?: number;

  @IsNumber()
  @IsOptional()
  maximumStock?: number;

  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsEnum(ItemStatus)
  @IsOptional()
  status?: ItemStatus;
}
