import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePointDto {
  @ApiPropertyOptional({ example: 1, description: 'Registrations.id' })
  @IsOptional()
  @IsNumber()
  registration_id?: number;

  @ApiPropertyOptional({ example: 'client01', description: 'Registration username or email' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ example: 25, description: 'Wallet value to add when converting points' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wallet_amount?: number;
}
