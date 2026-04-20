import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiPropertyOptional({ example: 'Acme Appraisals' })
  @IsOptional()
  @IsString()
  companyname?: string;

  @ApiPropertyOptional({ example: 'Google Ads' })
  @IsOptional()
  @IsString()
  referedby?: string;

  @ApiPropertyOptional({ example: '555-1234' })
  @IsOptional()
  @IsString()
  officeno?: string;

  @ApiPropertyOptional({ example: 'johndoe@mail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'john.doe',
    description: 'Unique username for client/employee login.',
  })
  @IsString()
  username: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  mobileno?: string;

  @ApiPropertyOptional({ example: 'New York Office' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'California' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '90001' })
  @IsOptional()
  @IsString()
  zipcode?: string;

  @ApiPropertyOptional({ example: 'Team Member', default: 'Client' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: 'Active', default: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'supervisor.user' })
  @IsOptional()
  @IsString()
  emp_supervisor?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wallete_balance?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ example: 'Yes' })
  @IsOptional()
  @IsString()
  accept_terms?: string;

  @ApiPropertyOptional({ example: 'Yes' })
  @IsOptional()
  @IsString()
  free_trial?: string;

  @ApiPropertyOptional({ example: 'Default instruction' })
  @IsOptional()
  @IsString()
  std_instr?: string;

  @ApiPropertyOptional({ example: 'Client' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'notify@mail.com' })
  @IsOptional()
  @IsString()
  altmail?: string;

  @ApiPropertyOptional({ example: '2026-05-08T00:00:00.000Z' })
  @IsOptional()
  expiry_date?: string | Date;

  @ApiPropertyOptional({
    example: 'ChangeMe@123',
    description: 'If omitted, the service assigns a safe default password.',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
