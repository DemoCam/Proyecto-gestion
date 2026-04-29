import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CallStatus } from '../schemas/call.schema';

export class CreateCallDto {
  @IsMongoId()
  @IsNotEmpty()
  customerId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  result: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  nextFollowUpDate?: string;

  @IsEnum(CallStatus)
  @IsOptional()
  status?: CallStatus;
}
