import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';
import { Credit } from './entity/credit.entity';
import { Users } from 'src/user/entities/user.entity';

@Injectable()
export class CreditService {
  constructor(
    @InjectRepository(Credit)
    private readonly creditRepo: Repository<Credit>,
  ) {}

  async create(dto: CreateCreditDto, user: Users): Promise<Credit> {
    const credit = this.creditRepo.create(dto);
    // credit.created_by = user.id;
    credit.created_on = Math.floor(Date.now() / 1000);
    return await this.creditRepo.save(credit);
  }

  async findAll(): Promise<Credit[]> {
    return await this.creditRepo.find({ where: { deleted: false } });
  }

  async findOne(id: string): Promise<Credit> {
    const credit = await this.creditRepo.findOneBy({ id });
    if (!credit) throw new NotFoundException(`Credit with id ${id} not found`);
    return credit;
  }

  async update(id: string, dto: UpdateCreditDto, user: Users): Promise<Credit> {
    const credit = await this.creditRepo.findOneBy({ id });
    if (!credit) throw new NotFoundException(`Credit with id ${id} not found`);
    await this.creditRepo.update(id, {
      ...dto,
      // modified_by: user.id,
      modified_on: Math.floor(Date.now() / 1000),
    });
    return await this.creditRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<Credit> {
    const ref = await this.creditRepo.findOneBy({ id });
    if (!ref) throw new NotFoundException(`Credit with id ${id} not found`);
    await this.creditRepo.update(id, { deleted: true });
    return await this.creditRepo.findOne({ where: { id } });
  }
}
