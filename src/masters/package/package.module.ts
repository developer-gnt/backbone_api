import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entity/package.entity';
import { ClientPackagePricing } from './entity/client-package-pricing.entity';
import { Users } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Package, ClientPackagePricing, Users])],
  providers: [PackageService],
  controllers: [PackageController],
})
export class PackageModule {}
