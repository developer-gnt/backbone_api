import { Module } from '@nestjs/common';
import { OrderTypeService } from './order-type.service';
import { OrderTypeController } from './order-type.controller';

@Module({
  providers: [OrderTypeService],
  controllers: [OrderTypeController],
})
export class OrderTypeModule {}
