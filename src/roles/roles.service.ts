import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Repository } from 'typeorm';
import { Roles } from './entities/roles.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private roleRepository: Repository<Roles>,
  ) {}

  async findAll() {
    return await this.roleRepository.find();
  }

  async findById(id: string) {
    return await this.roleRepository.findOneBy({ id });
  }

  async create(role: CreateRoleDto) {
    this.roleRepository.create(role);
    return await this.roleRepository.save(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    updateRoleDto.modified_on = Math.floor(Date.now() / 1000);
    return await this.roleRepository.update(id, updateRoleDto);
  }

  async remove(id: string) {
    return await this.roleRepository.delete(id);
  }
}
