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
import { FormsService } from './forms.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateFormsDto } from './dto/create-forms.dto';
import { UpdateFormsDto } from './dto/update-forms.dto';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';
import { Users } from 'src/user/entities/user.entity';

@ApiTags('Master Forms')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('masters/forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  create(@CurrentUser() user: Users, @Body() dto: CreateFormsDto) {
    return this.formsService.create(dto, user);
  }

  @Get()
  findAll() {
    return this.formsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: Users,
    @Param('id') id: string,
    @Body() dto: UpdateFormsDto,
  ) {
    return this.formsService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formsService.remove(id);
  }
}
