import { Module } from '@nestjs/common';
import { AlertAvailabilityService } from './alert-availability.service';
import { AlertAvailabilityController } from './alert-availability.controller';

@Module({
  providers: [AlertAvailabilityService],
  controllers: [AlertAvailabilityController],
})
export class AlertAvailabilityModule {}
