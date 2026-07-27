import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { Inspection26Service } from './inspection26.service';
import { CreateInspection26Dto } from './dto/create-inspection26.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('inspection26')
@UseGuards(JwtAuthGuard)
export class Inspection26Controller {
  constructor(private readonly inspection26Service: Inspection26Service) {}

  @Post()
  create(@Body() createDto: CreateInspection26Dto, @Req() req: any) {
    const user = req.user;
    return this.inspection26Service.create(createDto, user);
  }

  @Get()
  findAll(@Req() req: any) {
    const user = req.user;
    return this.inspection26Service.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    return this.inspection26Service.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any, @Req() req: any) {
    const user = req.user;
    return this.inspection26Service.update(id, updateDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    return this.inspection26Service.remove(id, user);
  }
}
