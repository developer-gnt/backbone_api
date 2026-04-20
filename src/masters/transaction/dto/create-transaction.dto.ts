import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  registration_id: number;

  @ApiProperty({ example: 1499 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  credits: number;

  @ApiPropertyOptional({ example: '0', default: '0' })
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiPropertyOptional({ example: 'Credit', default: 'Credit' })
  @IsOptional()
  @IsString()
  mode?: string;

  @ApiPropertyOptional({ example: 'Pending', default: 'Pending' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Package added by admin' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
