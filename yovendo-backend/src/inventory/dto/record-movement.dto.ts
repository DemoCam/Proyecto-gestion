import { IsString, IsNotEmpty, IsNumber, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { MovementType } from '../schemas/inventory-movement.schema';

export class RecordMovementDto {
  @IsMongoId()
  @IsNotEmpty()
  itemId: string;

  @IsEnum(MovementType)
  @IsNotEmpty()
  type: MovementType;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}
