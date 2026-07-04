import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeorm from './config/typeorm';
import { RolesModule } from './roles/roles.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PdfService } from './pdf/pdf.service';
import { PdfController } from './pdf/pdf.controller';
import { ExcelController } from './excel/excel.controller';
import { ExcelService } from './excel/excel.service';
import { NotificationModule } from './notification/notification.module';
import { StateModule } from './masters/state/state.module';
import { ReferenceModule } from './masters/reference/reference.module';
import { PackageModule } from './masters/package/package.module';
import { CreditModule } from './masters/credit/credit.module';
import { TransactionModule } from './masters/transaction/transaction.module';
import { PointsModule } from './masters/points/points.module';
import { OrderTypeModule } from './masters/order-type/order-type.module';
import { FormsModule } from './masters/forms/forms.module';
import { AlertAvailabilityModule } from './masters/alert-availability/alert-availability.module';
import { OrderModule } from './masters/order/order.module';
import { ReportModule } from './masters/report/report.module';
import { TatPricingModule } from './masters/tat-pricing/tat-pricing.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './packages/authorization/roles.guard';
import { PaypalModule } from './paypal/paypal.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [

    MulterModule.register({
      limits: {
        fileSize: 2 * 1024 * 1024 * 1024,
        files: 200,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    PaypalModule,
    RolesModule,
    UserModule,
    AuthModule,
    NotificationModule,
    StateModule,
    ReferenceModule,
    PackageModule,
    CreditModule,
    TransactionModule,
    PointsModule,
    OrderTypeModule,
    FormsModule,
    AlertAvailabilityModule,
    TatPricingModule,
    OrderModule,
    ReportModule,
  ],
  controllers: [AppController, PdfController, ExcelController],
  providers: [
    AppService,
    PdfService,
    ExcelService,

    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },

    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule { }
