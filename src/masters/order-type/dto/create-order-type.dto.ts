import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderTypeDto {
  @ApiPropertyOptional({ example: 1, description: 'Sequence number / id' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ example: 'Employment Order' })
  @IsString()
  order_type: string;
}
