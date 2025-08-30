import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { UpdateReferenceDto } from './dto/update-reference.dto';
import { Reference } from './entity/reference.entity';

@Injectable()
export class ReferenceService {
  constructor(
    @InjectRepository(Reference)
    private readonly referenceRepo: Repository<Reference>,
  ) {}

  async create(dto: CreateReferenceDto): Promise<Reference> {
    const ref = this.referenceRepo.create(dto);
    return await this.referenceRepo.save(ref);
  }

  async findAll(): Promise<Reference[]> {
    return await this.referenceRepo.find();
  }

  async findOne(id: string): Promise<Reference> {
    const ref = await this.referenceRepo.findOne({ where: { id } });
    if (!ref) throw new NotFoundException(`Reference ${id} not found`);
    return ref;
  }

  async update(id: string, dto: UpdateReferenceDto): Promise<Reference> {
    const ref = await this.findOne(id);
    Object.assign(ref, dto);
    return await this.referenceRepo.save(ref);
  }

  async remove(id: string): Promise<void> {
    const ref = await this.findOne(id);
    await this.referenceRepo.remove(ref);
  }
}
