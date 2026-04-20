import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PointsService } from './points.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePointDto } from './dto/create-points.dto';
import { UpdatePointDto } from './dto/update-points.dto';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';
import { Users } from 'src/user/entities/user.entity';

@ApiTags('Master Wallet')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('masters/points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('add')
  @ApiOperation({ summary: 'Add reward points to a registration' })
  create(@CurrentUser() user: Users, @Body() dto: CreatePointDto) {
    return this.pointsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'View registrations with wallet/points balances' })
  findAll() {
    return this.pointsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet and points balance for one registration' })
  findOne(@Param('id') id: string) {
    return this.pointsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update points or wallet conversion value directly' })
  update(
    @CurrentUser() user: Users,
    @Param('id') id: string,
    @Body() dto: UpdatePointDto,
  ) {
    return this.pointsService.update(id, dto, user);
  }

  @Post('credit')
  @ApiOperation({ summary: 'Add credits against bonus points' })
  convertBonusCredit(@Body() dto: CreatePointDto) {
    return this.pointsService.convertBonusCredit(dto);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert points into wallet balance' })
  convert(@Param('id') id: string, @Body() dto: CreatePointDto) {
    return this.pointsService.convert(id, dto);
  }
}
