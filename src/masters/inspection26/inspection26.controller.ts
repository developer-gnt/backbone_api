import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('email-pdf')
  @UseInterceptors(FileInterceptor('pdf'))
  emailPdf(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const user = req.user;
    return this.inspection26Service.emailPdf(file, user);
  }

  @Post('email-json')
  emailJson(@Body() body: any, @Req() req: any) {
    const user = req.user;
    return this.inspection26Service.emailJson(body, user);
  }

  @Post('email-form-as-pdf')
  emailFormAsPdf(@Body() body: any, @Req() req: any) {
    const user = req.user;
    return this.inspection26Service.emailFormAsPdf(body, user);
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
