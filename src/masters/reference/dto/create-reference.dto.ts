import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateReferenceDto {
  @ApiProperty({ example: 'Google Ads' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reference_source: string;
}
