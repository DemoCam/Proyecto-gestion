import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { CallStatus } from '../schemas/call.schema';

export class UpdateCallDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  result?: string;

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
