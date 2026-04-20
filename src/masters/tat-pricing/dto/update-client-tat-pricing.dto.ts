import { PartialType } from '@nestjs/mapped-types';
import { UpsertClientTatPricingDto } from './upsert-client-tat-pricing.dto';

export class UpdateClientTatPricingDto extends PartialType(
  UpsertClientTatPricingDto,
) {}