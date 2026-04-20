import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'client.user' })
  @IsOptional()
  @IsString()
  createdby?: string;

  @ApiPropertyOptional({ example: '12' })
  @IsOptional()
  @IsString()
  package?: string;

  @ApiPropertyOptional({ example: '3' })
  @IsOptional()
  @IsString()
  package_id?: string;

  @ApiPropertyOptional({ example: '2' })
  @IsOptional()
  @IsString()
  tat_package_id?: string;

  @ApiPropertyOptional({ example: 'TAT-12' })
  @IsOptional()
  @IsString()
  package_code?: string;

  @ApiPropertyOptional({ example: '12' })
  @IsOptional()
  @IsNumberString()
  tat_hours?: string | number;

  @ApiPropertyOptional({ example: '12' })
  @IsOptional()
  @IsNumberString()
  charged_amount?: string | number;

  @ApiPropertyOptional({ example: 'New Order', default: 'New Order' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Order notes from client' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Accepted' })
  @IsOptional()
  @IsString()
  reply?: string;

  @ApiPropertyOptional({ example: 'Urgent client request' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({ example: 'Need update on inspection timing' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: '1004' })
  @IsOptional()
  @IsString()
  order_type?: string;

  @ApiPropertyOptional({ example: 'CONVENTIONAL' })
  @IsOptional()
  @IsString()
  financing?: string;

  @ApiPropertyOptional({ example: 'No' })
  @IsOptional()
  @IsString()
  reoform?: string;

  @ApiPropertyOptional({ example: 'No' })
  @IsOptional()
  @IsString()
  non_uad?: string;

  @ApiPropertyOptional({ example: 'John Borrower' })
  @IsOptional()
  @IsString()
  borrower_name?: string;

  @ApiPropertyOptional({ example: '29 S. Pine St.' })
  @IsOptional()
  @IsString()
  subject_address?: string;

  @ApiPropertyOptional({ example: 'OH' })
  @IsOptional()
  @IsString()
  subject_state?: string;

  @ApiPropertyOptional({ example: 'Lorain' })
  @IsOptional()
  @IsString()
  subject_city?: string;

  @ApiPropertyOptional({ example: '44052' })
  @IsOptional()
  @IsString()
  subject_zipcode?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  subject_country?: string;

  @ApiPropertyOptional({ example: 'Use Arial 9 bold.' })
  @IsOptional()
  @IsString()
  standard_instruction?: string;

  @ApiPropertyOptional({ example: 'YES' })
  @IsOptional()
  @IsString()
  sketch?: string;

  @ApiPropertyOptional({ example: 'Any special order type notes' })
  @IsOptional()
  @IsString()
  order_type_comment?: string;

  @ApiPropertyOptional({ example: '12' })
  @IsOptional()
  @IsNumberString()
  amount?: string | number;

  @ApiPropertyOptional({ example: 'Very happy with the completed report' })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({ example: '5' })
  @IsOptional()
  @IsString()
  feedback_rating?: string | number;

  @ApiPropertyOptional({
    example: ['Order page/Engagement letter', 'Sales Contract'],
    type: [String],
  })
  @IsOptional()
  attachmentTypes?: string[] | string;
}
