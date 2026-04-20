import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { State } from './entity/state.entity';
import { Users } from 'src/user/entities/user.entity';
import { getNextNumericId } from 'src/utils/manual-id.util';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepo: Repository<State>,
  ) {}

  async create(dto: CreateStateDto, user: Users): Promise<State> {
    const nextId = await getNextNumericId(this.stateRepo);
    const state = this.stateRepo.create({ id: nextId, ...dto });
    return this.stateRepo.save(state);
  }

  async findAll(): Promise<State[]> {
    return this.stateRepo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: string): Promise<State> {
    const state = await this.stateRepo.findOne({ where: { id: Number(id) } });
    if (!state) throw new NotFoundException(`City #${id} not found`);
    return state;
  }

  async update(id: string, dto: UpdateStateDto, user: Users): Promise<State> {
    await this.findOne(id);
    await this.stateRepo.update(Number(id), dto as Partial<State>);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.stateRepo.delete(Number(id));
      return {
        message: 'City deleted successfully',
      };
    } catch {
      throw new BadRequestException(
        'Unable to delete this city right now. It may still be referenced elsewhere.',
      );
    }
  }
}
