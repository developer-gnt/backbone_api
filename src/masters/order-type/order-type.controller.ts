import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { OrderTypeService } from './order-type.service';
import { CreateOrderTypeDto } from './dto/create-order-type.dto';
import { UpdateOrderTypeDto } from './dto/update-order-type.dto';

@Controller('masters/order-type')
export class OrderTypeController {
  constructor(private readonly orderTypeService: OrderTypeService) {}

  @Post()
  create(@Body() dto: CreateOrderTypeDto) {
    return this.orderTypeService.create(dto);
  }

  @Get()
  findAll() {
    return this.orderTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderTypeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderTypeDto) {
    return this.orderTypeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderTypeService.remove(id);
  }
}
