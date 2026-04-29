import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SaleStatus } from '../schemas/sale.schema';
import { SaleItemDto } from './create-sale.dto';

export class UpdateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  @IsOptional()
  items?: SaleItemDto[];

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsEnum(SaleStatus)
  @IsOptional()
  status?: SaleStatus;

  @IsDateString()
  @IsOptional()
  saleDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
