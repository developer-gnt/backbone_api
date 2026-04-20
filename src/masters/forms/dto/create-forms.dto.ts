import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFormsDto {
  @ApiPropertyOptional({ example: 1, description: 'Sequence number / id' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ example: 'Background Verification' })
  @IsString()
  form: string;
}
