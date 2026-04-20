import { PartialType } from '@nestjs/mapped-types';
import { CreateCreditDto } from './create-credit.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCreditDto extends PartialType(CreateCreditDto) {
  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @IsNumber()
  wallete_balance?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  points?: number;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;
}
