import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { AlertAvailabilityService } from './alert-availability.service';
import { CreateAlertAvailabilityDto } from './dto/create-alert-availability.dto';
import { UpdateAlertAvailabilityDto } from './dto/update-alert-availability.dto';

@Controller('masters/alert-availability')
export class AlertAvailabilityController {
  constructor(private readonly alertService: AlertAvailabilityService) {}

  @Post()
  create(@Body() dto: CreateAlertAvailabilityDto) {
    return this.alertService.create(dto);
  }

  @Get()
  findAll() {
    return this.alertService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAlertAvailabilityDto) {
    return this.alertService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertService.remove(id);
  }
}
