import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/user/entities/user.entity';
import { Transaction } from '../transaction/entity/transaction.entity';
import { Package } from '../package/entity/package.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Transaction, Package])],
  providers: [CreditService],
  controllers: [CreditController],
})
export class CreditModule {}
