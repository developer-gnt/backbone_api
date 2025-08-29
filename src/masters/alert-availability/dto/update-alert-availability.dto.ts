import { PartialType } from '@nestjs/mapped-types';
import { CreateAlertAvailabilityDto } from './create-alert-availability.dto';

export class UpdateAlertAvailabilityDto extends PartialType(
  CreateAlertAvailabilityDto,
) {}
