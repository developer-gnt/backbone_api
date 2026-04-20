import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/user/entities/user.entity';
import { CompletedDownload } from '../order/entity/completed-download.entity';
import { Download } from '../order/entity/download.entity';
import { Order } from '../order/entity/order.entity';
import { Transaction } from '../transaction/entity/transaction.entity';
import { Attendance } from './entities/attendance.entity';
import { WebsiteAccessLog } from './entities/website-access-log.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      Order,
      Download,
      CompletedDownload,
      Transaction,
      Attendance,
      WebsiteAccessLog,
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
