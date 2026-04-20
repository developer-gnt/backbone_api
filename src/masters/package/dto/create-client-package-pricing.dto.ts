import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientPackagePricingDto {
  @ApiProperty({ example: 25 })
  @IsNotEmpty()
  userId: number | string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  packageId: number | string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  customPrice: number | string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  customCredit?: number | string;

  @ApiPropertyOptional({ example: 'Preferred legacy pricing for VIP client' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  isActive?: boolean;
}
