import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsNumber()
  modified_on?: number;

  @ApiProperty({
    example: 'Admin',
    description: 'Name of the role',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
