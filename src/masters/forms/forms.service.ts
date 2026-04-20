import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFormsDto } from './dto/create-forms.dto';
import { UpdateFormsDto } from './dto/update-forms.dto';
import { Forms } from './entity/forms.entity';
import { Users } from 'src/user/entities/user.entity';
import { getNextNumericId } from 'src/utils/manual-id.util';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Forms)
    private readonly formsRepo: Repository<Forms>,
  ) {}

  async create(dto: CreateFormsDto, user: Users): Promise<any> {
    const requestedId =
      dto.id !== undefined && dto.id !== null ? Number(dto.id) : null;
    const nextId = requestedId || (await getNextNumericId(this.formsRepo));

    const existing = await this.formsRepo.findOneBy({ id: nextId });
    if (existing) {
      throw new BadRequestException('Sequence number already exists');
    }

    const form = this.formsRepo.create({
      id: nextId,
      form: dto.form,
    });
    await this.formsRepo.save(form);

    return {
      message: 'Form Add Successfully',
      data: form,
    };
  }

  async findAll(): Promise<Forms[]> {
    return this.formsRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string): Promise<Forms> {
    const form = await this.formsRepo.findOneBy({ id: Number(id) });
    if (!form) throw new NotFoundException(`Form with id ${id} not found`);
    return form;
  }

  async update(id: string, dto: UpdateFormsDto, user: Users): Promise<any> {
    await this.findOne(id);
    await this.formsRepo.update(Number(id), {
      form: dto.form,
    });

    return {
      message: 'Form Updated Successfully',
      data: await this.findOne(id),
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.formsRepo.delete(Number(id));
      return {
        message: 'Form deleted successfully',
      };
    } catch {
      throw new BadRequestException(
        'Unable to delete this form right now. It may still be referenced elsewhere.',
      );
    }
  }
}
