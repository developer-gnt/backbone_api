import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCreditDto {
  @ApiPropertyOptional({ example: 1, description: 'Registrations.id' })
  @IsOptional()
  @IsNumber()
  registration_id?: number;

  @ApiPropertyOptional({ example: 'client01', description: 'Username or email of the client' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 100, description: 'Credits to add to wallet' })
  @IsNumber()
  @Min(0)
  credits: number;

  @ApiPropertyOptional({ example: 'Manual bonus by admin' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
