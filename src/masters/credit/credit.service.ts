import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';
import { Credit } from './entity/credit.entity';

@Injectable()
export class CreditService {
  constructor(
    @InjectRepository(Credit)
    private readonly creditRepo: Repository<Credit>,
  ) {}

  async create(dto: CreateCreditDto): Promise<Credit> {
    const credit = this.creditRepo.create(dto);
    return await this.creditRepo.save(credit);
  }

  async findAll(): Promise<Credit[]> {
    return await this.creditRepo.find();
  }

  async findOne(id: string): Promise<Credit> {
    const credit = await this.creditRepo.findOneBy({ id });
    if (!credit) throw new NotFoundException(`Credit with id ${id} not found`);
    return credit;
  }

  async update(id: string, dto: UpdateCreditDto): Promise<Credit> {
    const credit = await this.creditRepo.findOneBy({ id });
    if (!credit) throw new NotFoundException(`Credit with id ${id} not found`);
    await this.creditRepo.update(id, dto);
    return await this.creditRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.creditRepo.delete(id);
  }
}
