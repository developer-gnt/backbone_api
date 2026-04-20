import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  constructor(private readonly transactionService: TransactionService) {}

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
