import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { UpdateReferenceDto } from './dto/update-reference.dto';
import { Reference } from './entity/reference.entity';
import { Users } from 'src/user/entities/user.entity';
import { getNextNumericId } from 'src/utils/manual-id.util';

@Injectable()
export class ReferenceService {
  constructor(
    @InjectRepository(Reference)
    private readonly referenceRepo: Repository<Reference>,
  ) {}

  async create(dto: CreateReferenceDto, user: Users): Promise<Reference> {
    const nextId = await getNextNumericId(this.referenceRepo);
    const ref = this.referenceRepo.create({ id: nextId, ...dto });
    return this.referenceRepo.save(ref);
  }

  async findAll(): Promise<Reference[]> {
    return this.referenceRepo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: string): Promise<Reference> {
    const ref = await this.referenceRepo.findOne({ where: { id: Number(id) } });
    if (!ref) throw new NotFoundException(`Reference ${id} not found`);
    return ref;
  }

  async update(
    id: string,
    dto: UpdateReferenceDto,
    user: Users,
  ): Promise<Reference> {
    await this.findOne(id);
    await this.referenceRepo.update(Number(id), dto as Partial<Reference>);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.referenceRepo.delete(Number(id));
      return {
        message: 'Reference source deleted successfully',
      };
    } catch {
      throw new BadRequestException(
        'Unable to delete this reference source right now. It may still be referenced elsewhere.',
      );
    }
  }
}
