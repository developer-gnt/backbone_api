import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { Users } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [PointsController],
  providers: [PointsService],
})
export class PointsModule {}
