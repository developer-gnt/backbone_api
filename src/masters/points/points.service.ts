import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Points } from './entity/points.entity';
import { CreatePointDto } from './dto/create-points.dto';
import { UpdatePointDto } from './dto/update-points.dto';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Points)
    private readonly pointsRepository: Repository<Points>,
  ) {}

  async create(dto: CreatePointDto): Promise<Points> {
    const point = this.pointsRepository.create({
      user_name: dto.user_name,
      point: dto.point,
    });
    return await this.pointsRepository.save(point);
  }

  async findAll(): Promise<Points[]> {
    return await this.pointsRepository.find();
  }

  async findOne(id: string): Promise<Points> {
    return await this.pointsRepository.findOneBy({ id });
  }

  async update(id: string, dto: UpdatePointDto): Promise<Points> {
    const point = await this.pointsRepository.findOneBy({ id });
    if (!point) {
      throw new NotFoundException(`Point with id ${id} not found`);
    }

    await this.pointsRepository.update(id, dto);

    return await this.pointsRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<any> {
    await this.pointsRepository.delete(id);
    return 'Deleted sucessfully';
  }
}
