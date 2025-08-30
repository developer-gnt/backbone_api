import { Module } from '@nestjs/common';
import { OrderTypeService } from './order-type.service';
import { OrderTypeController } from './order-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderType } from './entity/order-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderType])],
  providers: [OrderTypeService],
  controllers: [OrderTypeController],
})
export class OrderTypeModule {}
