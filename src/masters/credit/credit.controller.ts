import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreditService } from './credit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';
import { CurrentUser } from '../../auth/decorators/current-user-decorator';
import { Users } from '../../user/entities/user.entity';

@ApiTags('Master Wallet')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('masters/wallet')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Post('credit')
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiOperation({ summary: 'Add manual bonus credit to wallet' })
  create(@CurrentUser() user: Users, @Body() dto: CreateCreditDto) {
    return this.creditService.addCredit(dto);
  }

  @Post('deduct')
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiOperation({ summary: 'Manually deduct credit from wallet' })
  deduct(@CurrentUser() user: Users, @Body() dto: CreateCreditDto) {
    return this.creditService.deductCredit(dto);
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
