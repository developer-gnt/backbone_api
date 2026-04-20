import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { Authorize } from 'src/packages/authorization/roles.decorator';
import { PermissionKey } from 'src/packages/authorization/permission-key.enum';

@ApiTags('Master Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Authorize([PermissionKey.CreateUser])
  @ApiOperation({ summary: 'Create employee or admin-facing user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createEmployee(createUserDto);
  }

  @Post('employees')
  @Authorize([PermissionKey.CreateUser])
  @ApiOperation({ summary: 'Create employee or admin-facing user' })
  createEmployee(@Body() createUserDto: CreateUserDto) {
    return this.userService.createEmployee(createUserDto);
  }

  @Get()
  @Authorize([PermissionKey.GetUser])
  @ApiOperation({ summary: 'Get all users or filter by role' })
  findAll(@Query('role') role?: string) {
    return this.userService.findAll(role);
  }

  @Get('clients')
  @Authorize([PermissionKey.GetUser])
  @ApiOperation({ summary: 'Get all client registrations with filters' })
  getClients(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('username') username?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.userService.getClients({
      name,
      email,
      username,
      pageSize,
    });
  }

  @Get('employees')
  @Authorize([PermissionKey.GetUser])
  @ApiOperation({ summary: 'Get employees, supervisors and admins' })
  getEmployees(@Query('role') role?: string) {
    return this.userService.getEmployees(role);
  }

  @Get(':id')
  @Authorize([PermissionKey.GetUser])
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Authorize([PermissionKey.EditUser])
  @ApiOperation({ summary: 'Update employee or user details' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Patch(':id/status')
  @Authorize([PermissionKey.EditUser])
  @ApiOperation({ summary: 'Activate / deactivate / hold / terminate a user' })
  changeStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.userService.changeStatus(id, body.status);
  }

  @Patch(':id/assign-supervisor')
  @Authorize([PermissionKey.EditUser])
  @ApiOperation({ summary: 'Assign supervisor to employee or client' })
  assignSupervisor(
    @Param('id') id: string,
    @Body() body: { supervisorId: string },
  ) {
    return this.userService.assignSupervisor(id, body.supervisorId);
  }

  @Post(':id/send-login-details')
  @Authorize([PermissionKey.EditUser])
  @ApiOperation({ summary: 'Send client login details email' })
  sendLoginDetails(@Param('id') id: string) {
    return this.userService.sendLoginDetails(id);
  }

  @Delete(':id')
  @Authorize([PermissionKey.DeleteUser])
  @ApiOperation({ summary: 'Soft deactivate a user without data loss' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
