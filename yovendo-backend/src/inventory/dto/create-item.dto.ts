import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemStatus } from '../schemas/inventory-item.schema';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  currentStock?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minimumStock?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maximumStock?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  salePrice?: number;

  @IsEnum(ItemStatus)
  @IsOptional()
  status?: ItemStatus;
}
