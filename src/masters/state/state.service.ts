import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { State } from './entity/state.entity';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepo: Repository<State>,
  ) {}

  async create(dto: CreateStateDto): Promise<State> {
    const state = this.stateRepo.create(dto);
    return this.stateRepo.save(state);
  }

  async findAll(): Promise<State[]> {
    return this.stateRepo.find();
  }

  async findOne(id: string): Promise<State> {
    const state = await this.stateRepo.findOne({ where: { id } });
    if (!state) throw new NotFoundException(`State #${id} not found`);
    return state;
  }

  async update(id: string, dto: UpdateStateDto): Promise<State> {
    const state = await this.findOne(id);
    Object.assign(state, dto);
    return this.stateRepo.save(state);
  }

  async remove(id: string): Promise<void> {
    const state = await this.findOne(id);
    await this.stateRepo.remove(state);
  }
}
