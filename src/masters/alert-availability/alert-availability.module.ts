import { Module } from '@nestjs/common';
import { AlertAvailabilityService } from './alert-availability.service';
import { AlertAvailabilityController } from './alert-availability.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertAvailability } from './entity/alert-availability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlertAvailability])],
  providers: [AlertAvailabilityService],
  controllers: [AlertAvailabilityController],
})
export class AlertAvailabilityModule {}
