import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFormsDto } from './dto/create-forms.dto';
import { UpdateFormsDto } from './dto/update-forms.dto';
import { Forms } from './entity/forms.entity';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Forms)
    private readonly formsRepo: Repository<Forms>,
  ) {}

  async create(dto: CreateFormsDto): Promise<Forms> {
    const form = this.formsRepo.create(dto);
    return await this.formsRepo.save(form);
  }

  async findAll(): Promise<Forms[]> {
    return await this.formsRepo.find();
  }

  async findOne(id: string): Promise<Forms> {
    const form = await this.formsRepo.findOneBy({ id });
    if (!form) throw new NotFoundException(`Form with id ${id} not found`);
    return form;
  }

  async update(id: string, dto: UpdateFormsDto): Promise<Forms> {
    const form = await this.formsRepo.findOneBy({ id });
    if (!form) throw new NotFoundException(`Form with id ${id} not found`);
    await this.formsRepo.update(id, dto);
    return await this.formsRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.formsRepo.delete(id);
  }
}
