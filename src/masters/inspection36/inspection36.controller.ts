import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards, UseInterceptors, UploadedFile, StreamableFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Inspection36Service } from './inspection36.service';
import { CreateInspection36Dto } from './dto/create-inspection36.dto';
import { UpdateInspection36Dto } from './dto/update-inspection36.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inspection36')
export class Inspection36Controller {
  constructor(private readonly inspection36Service: Inspection36Service) {}

  @Post()
  create(@Body() createInspection36Dto: CreateInspection36Dto, @Req() req: any) {
    return this.inspection36Service.create(createInspection36Dto, req.user);
  }

  @Post('email-pdf')
  @UseInterceptors(FileInterceptor('pdf'))
  emailPdf(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.inspection36Service.emailPdf(file, req.user);
  }

  @Post('email-json')
  emailJson(@Body() body: any, @Req() req: any) {
    return this.inspection36Service.emailJson(body, req.user);
  }

  @Post('generate-pdf')
  async generatePdf(@Body() body: any, @Req() req: any, @Res({ passthrough: true }) res: any): Promise<StreamableFile> {
    const pdfBytes = await this.inspection36Service.generatePdfBytes(body, req.user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="inspection.pdf"',
    });
    return new StreamableFile(Buffer.from(pdfBytes));
  }

  @Post('email-form-as-pdf')
  emailFormAsPdf(@Body() body: any, @Req() req: any) {
    return this.inspection36Service.emailFormAsPdf(body, req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.inspection36Service.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.inspection36Service.findOne(id, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInspection36Dto: UpdateInspection36Dto, @Req() req: any) {
    return this.inspection36Service.update(id, updateInspection36Dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.inspection36Service.remove(id, req.user);
  }
}
