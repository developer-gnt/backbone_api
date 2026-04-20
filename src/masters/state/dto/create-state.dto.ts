import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateStateDto {
  @ApiProperty({ example: 'Los Angeles' })
  @IsString()
  city: string;
}
