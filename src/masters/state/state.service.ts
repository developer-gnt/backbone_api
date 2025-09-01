import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { State } from './entity/state.entity';
import { Users } from 'src/user/entities/user.entity';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepo: Repository<State>,
  ) {}

  async create(dto: CreateStateDto, user: Users): Promise<State> {
    const state = this.stateRepo.create(dto);
    // state.created_by = user.id;
    state.created_on = Math.floor(Date.now() / 1000);
    return this.stateRepo.save(state);
  }

  async findAll(): Promise<State[]> {
    return this.stateRepo.find({ where: { deleted: false } });
  }

  async findOne(id: string): Promise<State> {
    const state = await this.stateRepo.findOne({ where: { id } });
    if (!state) throw new NotFoundException(`State #${id} not found`);
    return state;
  }

  async update(id: string, dto: UpdateStateDto, user: Users): Promise<State> {
    const state = await this.findOne(id);
    if (!state)
      throw new NotFoundException(`Transaction with id ${id} not found`);
    await this.stateRepo.update(id, {
      ...dto,
      // modified_by: user.id,
      modified_on: Math.floor(Date.now() / 1000),
    });
    return await this.stateRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<State> {
    const state = this.stateRepo.findOneBy({ id });
    if (!state) throw new NotFoundException(`State with id ${id} not found`);
    await this.stateRepo.update(id, { deleted: true });
    return await this.stateRepo.findOne({ where: { id } });
  }
}
