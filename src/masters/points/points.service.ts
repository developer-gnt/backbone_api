import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Points } from './entity/points.entity';
import { CreatePointDto } from './dto/create-points.dto';
import { UpdatePointDto } from './dto/update-points.dto';
import { Users } from 'src/user/entities/user.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Points)
    private readonly pointsRepository: Repository<Points>,
  ) {}

  async create(dto: CreatePointDto, user: Users): Promise<Points> {
    const point = this.pointsRepository.create({
      user_name: dto.user_name,
      point: dto.point,
    });
    // point.created_by = user.id;
    point.created_on = Math.floor(Date.now() / 1000);
    return await this.pointsRepository.save(point);
  }

  async findAll(): Promise<Points[]> {
    return await this.pointsRepository.find({ where: { deleted: false } });
  }

  async findOne(id: string): Promise<Points> {
    return await this.pointsRepository.findOneBy({ id });
  }

  async update(id: string, dto: UpdatePointDto, user: Users): Promise<Points> {
    const point = await this.pointsRepository.findOneBy({ id });
    if (!point) {
      throw new NotFoundException(`Point with id ${id} not found`);
    }

    await this.pointsRepository.update(id, {
      ...dto,
      // modified_by: user.id,
      modified_on: Math.floor(Date.now() / 1000),
    });

    return await this.pointsRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<any> {
    const ref = await this.pointsRepository.findOneBy({ id });
    if (!ref) throw new NotFoundException(`Point with id ${id} not found`);
    await this.pointsRepository.update(id, { deleted: true });
    return await this.pointsRepository.findOne({ where: { id } });
  }
}
