import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumberString, IsOptional, IsString } from 'class-validator';

export class UpsertClientTatPricingDto {
  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumberString()
  clientId?: string | number;

  @ApiPropertyOptional({ example: 'client.user' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 2 })
  @IsNumberString()
  tatPackageId: string | number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumberString()
  customPrice?: string | number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-04-16T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  effectiveFrom?: string;

  @ApiPropertyOptional({ example: '2026-05-16T23:59:59.999Z' })
  @IsOptional()
  @IsString()
  effectiveTo?: string;
}