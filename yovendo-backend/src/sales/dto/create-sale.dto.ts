import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, IsMongoId } from 'class-validator';
import { SaleStatus } from '../schemas/sale.schema';

export class SaleItemDto {
  @IsMongoId()
  @IsOptional()
  inventoryItemId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  unitPrice?: number;
}

export class CreateSaleDto {
  @IsMongoId()
  @IsNotEmpty()
  customerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  @IsOptional()
  items?: SaleItemDto[];

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  totalAmount: number;

  @IsEnum(SaleStatus)
  @IsOptional()
  status?: SaleStatus;

  @IsDateString()
  @IsNotEmpty()
  saleDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
