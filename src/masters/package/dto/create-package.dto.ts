import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({ example: 'Starter Package' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: '30 days' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({ example: 1499 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  credit: number;
}
