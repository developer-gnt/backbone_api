import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreditService } from './credit.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';
import { Users } from 'src/user/entities/user.entity';

@ApiTags('Master Wallet')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('masters/wallet')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Post('credit')
  @ApiOperation({ summary: 'Add manual bonus credit to wallet' })
  create(@CurrentUser() user: Users, @Body() dto: CreateCreditDto) {
    return this.creditService.addCredit(dto);
  }

  @Post('package')
  @ApiOperation({ summary: 'Add package transaction and wallet credits' })
  addTransaction(
    @Body()
    dto: {
      registration_id?: number;
      username?: string;
      package_id: number;
      remarks?: string;
    },
  ) {
    return this.creditService.addTransaction(dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'View wallet transaction history' })
  findAll() {
    return this.creditService.findAll();
  }

  @Get('transactions/:id')
  findOne(@Param('id') id: string) {
    return this.creditService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update wallet or points balance directly' })
  update(
    @CurrentUser() user: Users,
    @Param('id') id: string,
    @Body() dto: UpdateCreditDto,
  ) {
    return this.creditService.update(id, dto, user);
  }
}
