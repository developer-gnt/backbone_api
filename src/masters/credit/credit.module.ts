import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credit } from './entity/credit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credit])],
  providers: [CreditService],
  controllers: [CreditController],
})
export class CreditModule {}
