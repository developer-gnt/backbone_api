import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Public } from 'src/public-strategy';
import { Users } from 'src/user/entities/user.entity';
import { NotificationService } from './notification.service';

@Controller('notification')
@ApiTags('Notification Controller')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Public()
  @Post('contact')
  @ApiOperation({ summary: 'Send a contact-us enquiry to the Backbone support inbox' })
  async sendContactMessage(
    @Body()
    body: {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    },
  ) {
    return this.notificationService.sendContactMessage(body);
  }

  @ApiBearerAuth('access-token')
  @Post('mass-email')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send a bulk email to client recipients' })
  async sendMassEmail(
    @Body()
    body: {
      subject?: string;
      message?: string;
      recipientIds?: Array<number | string>;
      sendToAllClients?: boolean;
    },
  ) {
    return this.notificationService.sendMassEmail(body);
  }

  @ApiBearerAuth('access-token')
  @Post('referral')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Save a client referral and notify the team' })
  async saveReferral(
    @CurrentUser() user: Users,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      email?: string;
      mobile?: string;
    },
  ) {
    return this.notificationService.saveReferral(user, body);
  }
}
