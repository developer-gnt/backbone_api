import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';

@Controller('masters/credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Post()
  create(@Body() dto: CreateCreditDto) {
    return this.creditService.create(dto);
  }

  @Get()
  findAll() {
    return this.creditService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCreditDto) {
    return this.creditService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditService.remove(id);
  }
}
