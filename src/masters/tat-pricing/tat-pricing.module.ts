import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/user/entities/user.entity';
import { ClientTatPricing } from './entity/client-tat-pricing.entity';
import { TatPackage } from './entity/tat-package.entity';
import { TatPricingController } from './tat-pricing.controller';
import { TatPricingService } from './tat-pricing.service';

@Module({
  imports: [TypeOrmModule.forFeature([TatPackage, ClientTatPricing, Users])],
  controllers: [TatPricingController],
  providers: [TatPricingService],
  exports: [TatPricingService, TypeOrmModule],
})
export class TatPricingModule {}