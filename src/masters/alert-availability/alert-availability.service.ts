import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlertAvailabilityDto } from './dto/create-alert-availability.dto';
import { UpdateAlertAvailabilityDto } from './dto/update-alert-availability.dto';
import { AlertAvailability } from './entity/alert-availability.entity';

@Injectable()
export class AlertAvailabilityService {
  constructor(
    @InjectRepository(AlertAvailability)
    private readonly alertRepo: Repository<AlertAvailability>,
  ) {}

  async create(dto: CreateAlertAvailabilityDto): Promise<AlertAvailability> {
    const alert = this.alertRepo.create(dto);
    return await this.alertRepo.save(alert);
  }

  async findAll(): Promise<AlertAvailability[]> {
    return await this.alertRepo.find();
  }

  async findOne(id: string): Promise<AlertAvailability> {
    const alert = await this.alertRepo.findOneBy({ id });
    if (!alert)
      throw new NotFoundException(`AlertAvailability with id ${id} not found`);
    return alert;
  }

  async update(
    id: string,
    dto: UpdateAlertAvailabilityDto,
  ): Promise<AlertAvailability> {
    const alert = await this.alertRepo.findOneBy({ id });
    if (!alert)
      throw new NotFoundException(`AlertAvailability with id ${id} not found`);
    await this.alertRepo.update(id, dto);
    return await this.alertRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.alertRepo.delete(id);
  }
}
