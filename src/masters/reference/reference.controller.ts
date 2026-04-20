import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReferenceService } from './reference.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { UpdateReferenceDto } from './dto/update-reference.dto';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';
import { Users } from 'src/user/entities/user.entity';

@ApiTags('Master References')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('masters/reference')
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Post()
  create(@CurrentUser() user: Users, @Body() dto: CreateReferenceDto) {
    return this.referenceService.create(dto, user);
  }

  @Get()
  findAll() {
    return this.referenceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.referenceService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: Users,
    @Param('id') id: string,
    @Body() dto: UpdateReferenceDto,
  ) {
    return this.referenceService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.referenceService.remove(id);
  }
}
