import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entity/package.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Package])],
  providers: [PackageService],
  controllers: [PackageController],
})
export class PackageModule {}
