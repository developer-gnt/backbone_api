import {
  // BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  // NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';
import { PermissionKey } from 'src/packages/authorization/permission-key.enum';
import { Authorize } from 'src/packages/authorization/roles.decorator';

const basePath = 'roles';
@ApiBearerAuth('authorization')
@ApiTags('Role Controller')
@Controller(basePath)
export class RolesController {
  constructor(private roleService: RolesService) {}

  @Get()
  @Authorize([PermissionKey.GetRole])
  @ApiOperation({ summary: 'Fetch All Roles' })
  @ApiResponse({ status: 200, description: 'Roles Fetched Successfully' })
  async find() {
    return await this.roleService.findAll();
  }

  @Get(':id')
  @Authorize([PermissionKey.GetRole])
  @ApiOperation({ summary: 'Get Role by Id' })
  @ApiResponse({ status: 200, description: 'Role Fetched Successfully' })
  async findById(@Param('id') id: string) {
    return await this.roleService.findById(id);
  }

  @Post()
  @Authorize([PermissionKey.CreateRole])
  @ApiOperation({ summary: 'Add a new role' })
  @ApiResponse({ status: 201, description: 'Role Added Successfully' })
  async create(@Body() role: CreateRoleDto) {
    return await this.roleService.create(role);
  }

  @Patch(':id')
  @Authorize([PermissionKey.EditRole])
  @ApiOperation({ summary: 'Update Role by Id' })
  @ApiResponse({ status: 204, description: 'Role Updated Successfully' })
  async update(@Param('id') id: string, @Body() role: UpdateRoleDto) {
    await this.roleService.update(id, role);
    return {
      message: 'Row Updated Sucessfully',
    };
  }

  @Delete(':id')
  @Authorize([PermissionKey.DeleteRole])
  @ApiOperation({ summary: 'deleted Role by Id' })
  @ApiResponse({ status: 204, description: 'Role Deleted Successfully' })
  async remove(@Param('id') id: string) {
    await this.roleService.remove(id);
    return { message: 'Role deleted successfully' };
  }
}
