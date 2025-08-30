import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { Points } from './entity/points.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Points])],
  controllers: [PointsController],
  providers: [PointsService],
})
export class PointsModule {}
