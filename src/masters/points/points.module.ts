import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { Users } from 'src/user/entities/user.entity';
import { Transaction } from '../transaction/entity/transaction.entity';
import { PointTransaction } from './entity/point-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Transaction, PointTransaction])],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
