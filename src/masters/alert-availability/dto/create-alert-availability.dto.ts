import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAlertAvailabilityDto {
  @ApiProperty({ example: 'Standard Package' })
  @IsString()
  package: string;

  @ApiProperty({ example: 'Available in 24 hours' })
  @IsString()
  msg: string;
}
