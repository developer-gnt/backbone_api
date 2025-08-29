import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { StateService } from './state.service';

@Controller('masters/state')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Post()
  create(@Body() dto: CreateStateDto) {
    return this.stateService.create(dto);
  }

  @Get()
  findAll() {
    return this.stateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stateService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStateDto) {
    return this.stateService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stateService.remove(id);
  }
}
