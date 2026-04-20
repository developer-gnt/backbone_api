import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/user/entities/user.entity';
import { TatPricingModule } from '../tat-pricing/tat-pricing.module';
import { Transaction } from '../transaction/entity/transaction.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ChatMessage } from './entity/chat-message.entity';
import { CompletedDownload } from './entity/completed-download.entity';
import { Download } from './entity/download.entity';
import { Order } from './entity/order.entity';

@Module({
  imports: [
    TatPricingModule,
    TypeOrmModule.forFeature([
      Order,
      Download,
      CompletedDownload,
      Users,
      Transaction,
      ChatMessage,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
