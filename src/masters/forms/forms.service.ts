import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFormsDto } from './dto/create-forms.dto';
import { UpdateFormsDto } from './dto/update-forms.dto';
import { Forms } from './entity/forms.entity';
import { Users } from 'src/user/entities/user.entity';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Forms)
    private readonly formsRepo: Repository<Forms>,
  ) {}

  async create(dto: CreateFormsDto, user: Users): Promise<Forms> {
    const form = this.formsRepo.create(dto);
    // form.created_by = user.id;
    form.created_on = Math.floor(Date.now() / 1000);
    return await this.formsRepo.save(form);
  }

  async findAll(): Promise<Forms[]> {
    return await this.formsRepo.find({ where: { deleted: false } });
  }

  async findOne(id: string): Promise<Forms> {
    const form = await this.formsRepo.findOneBy({ id });
    if (!form) throw new NotFoundException(`Form with id ${id} not found`);
    return form;
  }

  async update(id: string, dto: UpdateFormsDto, user: Users): Promise<Forms> {
    const form = await this.formsRepo.findOneBy({ id });
    if (!form) throw new NotFoundException(`Form with id ${id} not found`);
    await this.formsRepo.update(id, {
      ...dto,
      // modified_by: user.id,
      modified_on: Math.floor(Date.now() / 1000),
    });
    return await this.formsRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<Forms> {
    const ref = await this.formsRepo.findOneBy({ id });
    if (!ref) throw new NotFoundException(`Point with id ${id} not found`);
    await this.formsRepo.update(id, { deleted: true });
    return await this.formsRepo.findOne({ where: { id } });
  }
}
