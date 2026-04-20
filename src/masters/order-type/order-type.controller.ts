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
import { OrderTypeService } from './order-type.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateOrderTypeDto } from './dto/create-order-type.dto';
import { UpdateOrderTypeDto } from './dto/update-order-type.dto';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';
import { Users } from 'src/user/entities/user.entity';

@ApiTags('Master Order Types')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('masters/order-type')
export class OrderTypeController {
  constructor(private readonly orderTypeService: OrderTypeService) {}

  @Post()
  create(@CurrentUser() user: Users, @Body() dto: CreateOrderTypeDto) {
    return this.orderTypeService.create(dto, user);
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
  update(
    @CurrentUser() user: Users,
    @Param('id') id: string,
    @Body() dto: UpdateOrderTypeDto,
  ) {
    return this.orderTypeService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderTypeService.remove(id);
  }
}
