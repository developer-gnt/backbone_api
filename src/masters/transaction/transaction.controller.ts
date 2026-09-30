import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Users } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';
import { Public } from 'src/public-strategy';

@ApiTags('Master Transactions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('masters/transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post()
  @ApiOperation({ summary: 'Create a pending transaction history record' })
  create(@CurrentUser() user: Users, @Body() dto: CreateTransactionDto) {
    return this.transactionService.create(dto, user);
  }

  @Post('checkout-order')
  @Public()
  @ApiOperation({ summary: 'Create a Razorpay checkout order for the public payment page' })
  createCheckoutOrder(
    @Body()
    body: {
      amount?: string | number;
      contact?: string;
      name?: string;
      product?: string;
      email?: string;
    },
  ) {
    return this.transactionService.createCheckoutOrder(body);
  }

  @Post('paypal/create')
  @ApiOperation({ summary: 'Create PayPal payment for wallet credits' })
  createPaypalPayment(
    @CurrentUser() user: Users,
    @Body() body: { credits: number },
  ) {
    return this.transactionService.createPaypalTransaction(
      user,
      Number(body.credits),
    );
  }

  @Public()
  @Get('paypal/success')
  async paypalSuccess(
    @Query('transactionId') transactionId: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    try {
      await this.transactionService.completePaypalTransaction(
        Number(transactionId),
        token,
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-success?status=success`,
      );
    } catch (error) {
      console.error(error);

      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-success?status=failed`,
      );
    }
  }

  @Public()
  @Get('paypal/cancel')
  paypalCancel(
    @Res() res: Response,
  ) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-success?status=cancel`,
    );
  }

  @Post('checkout-verify')
  @Public()
  @ApiOperation({ summary: 'Verify the Razorpay checkout callback signature' })
  verifyCheckout(
    @Body()
    body: {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    },
  ) {
    return this.transactionService.verifyCheckout(body);
  }

  @Get()
  @ApiOperation({ summary: 'View transaction report entries' })
  findAll(@Query('status') status?: string) {
    return this.transactionService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: Users,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(id, dto, user);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve transaction and apply wallet credit' })
  approve(@Param('id') id: string) {
    return this.transactionService.approve(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Mark transaction as deleted without data loss' })
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }
}
