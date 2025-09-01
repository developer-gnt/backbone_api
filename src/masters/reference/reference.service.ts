import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { UpdateReferenceDto } from './dto/update-reference.dto';
import { Reference } from './entity/reference.entity';
import { Users } from 'src/user/entities/user.entity';

@Injectable()
export class ReferenceService {
  constructor(
    @InjectRepository(Reference)
    private readonly referenceRepo: Repository<Reference>,
  ) {}

  async create(dto: CreateReferenceDto, user: Users): Promise<Reference> {
    const ref = this.referenceRepo.create(dto);
    // ref.created_by = user.id;
    ref.created_on = Math.floor(Date.now() / 1000);
    return await this.referenceRepo.save(ref);
  }

  async findAll(): Promise<Reference[]> {
    return await this.referenceRepo.find({ where: { deleted: false } });
  }

  async findOne(id: string): Promise<Reference> {
    const ref = await this.referenceRepo.findOne({ where: { id } });
    if (!ref) throw new NotFoundException(`Reference ${id} not found`);
    return ref;
  }

  async update(
    id: string,
    dto: UpdateReferenceDto,
    user: Users,
  ): Promise<Reference> {
    const ref = await this.findOne(id);
    if (!ref)
      throw new NotFoundException(`Transaction with id ${id} not found`);
    await this.referenceRepo.update(id, {
      ...dto,
      // modified_by: user.id,
      modified_on: Math.floor(Date.now() / 1000),
    });
    return await this.referenceRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<Reference> {
    const ref = await this.referenceRepo.findOneBy({ id });
    if (!ref) throw new NotFoundException(`Reference with id ${id} not found`);
    await this.referenceRepo.update(id, { deleted: true });
    return await this.referenceRepo.findOne({ where: { id } });
  }
}
