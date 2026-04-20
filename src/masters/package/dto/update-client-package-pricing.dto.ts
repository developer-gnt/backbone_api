import { PartialType } from '@nestjs/mapped-types';
import { CreateClientPackagePricingDto } from './create-client-package-pricing.dto';

export class UpdateClientPackagePricingDto extends PartialType(
  CreateClientPackagePricingDto,
) {}
