import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { StateService } from './state.service';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';
import { Users } from 'src/user/entities/user.entity';

@ApiTags('Master Location')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('masters/state')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Post()
  create(@CurrentUser() user: Users, @Body() dto: CreateStateDto) {
    return this.stateService.create(dto, user);
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
  update(
    @CurrentUser() user: Users,
    @Param('id') id: string,
    @Body() dto: UpdateStateDto,
  ) {
    return this.stateService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stateService.remove(id);
  }
}
