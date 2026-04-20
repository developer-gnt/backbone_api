import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/user/entities/user.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Referral } from './entities/referral.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Referral])],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
