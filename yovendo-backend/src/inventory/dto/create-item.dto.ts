import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsMongoId } from 'class-validator';
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
