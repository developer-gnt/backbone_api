import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AlertAvailabilityService } from './alert-availability.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateAlertAvailabilityDto } from './dto/create-alert-availability.dto';
import { UpdateAlertAvailabilityDto } from './dto/update-alert-availability.dto';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';
import { Users } from 'src/user/entities/user.entity';

@ApiTags('Master Availability')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('masters/alert-availability')
export class AlertAvailabilityController {
  constructor(private readonly alertService: AlertAvailabilityService) {}

  @Post()
  create(@CurrentUser() user: Users, @Body() dto: CreateAlertAvailabilityDto) {
    return this.alertService.create(dto, user);
  }

  @Get()
  findAll() {
    return this.alertService.findAll();
  }

  @Get(':packageName')
  findOne(@Param('packageName') packageName: string) {
    return this.alertService.findOne(packageName);
  }

  @Patch(':packageName')
  update(
    @CurrentUser() user: Users,
    @Param('packageName') packageName: string,
    @Body() dto: UpdateAlertAvailabilityDto,
  ) {
    return this.alertService.update(packageName, dto, user);
  }

  @Delete(':packageName')
  remove(@Param('packageName') packageName: string) {
    return this.alertService.remove(packageName);
  }
}
