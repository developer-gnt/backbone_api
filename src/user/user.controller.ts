import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { Authorize } from 'src/packages/authorization/roles.decorator';
import { PermissionKey } from 'src/packages/authorization/permission-key.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Authorize([PermissionKey.CreateUser])
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Authorize([PermissionKey.GetUser])
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Authorize([PermissionKey.GetUser])
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Authorize([PermissionKey.EditUser])
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Authorize([PermissionKey.DeleteUser])
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
