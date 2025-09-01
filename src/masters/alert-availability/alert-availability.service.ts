import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlertAvailabilityDto } from './dto/create-alert-availability.dto';
import { UpdateAlertAvailabilityDto } from './dto/update-alert-availability.dto';
import { AlertAvailability } from './entity/alert-availability.entity';
import { Users } from 'src/user/entities/user.entity';

@Injectable()
export class AlertAvailabilityService {
  constructor(
    @InjectRepository(AlertAvailability)
    private readonly alertRepo: Repository<AlertAvailability>,
  ) {}

  async create(
    dto: CreateAlertAvailabilityDto,
    user: Users,
  ): Promise<AlertAvailability> {
    const alert = this.alertRepo.create(dto);
    // alert.created_by = user.id;
    alert.created_on = Math.floor(Date.now() / 1000);
    return await this.alertRepo.save(alert);
  }

  async findAll(): Promise<AlertAvailability[]> {
    return await this.alertRepo.find({ where: { deleted: false } });
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
    user: Users,
  ): Promise<AlertAvailability> {
    const alert = await this.alertRepo.findOneBy({ id });
    if (!alert)
      throw new NotFoundException(`AlertAvailability with id ${id} not found`);
    await this.alertRepo.update(id, {
      ...dto,
      // modified_by: user.id,
      modified_on: Math.floor(Date.now() / 1000),
    });
    return await this.alertRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<AlertAvailability> {
    const ref = await this.alertRepo.findOneBy({ id });
    if (!ref)
      throw new NotFoundException(`Alert Availability with id ${id} not found`);
    await this.alertRepo.update(id, { deleted: true });
    return await this.alertRepo.findOne({ where: { id } });
  }
}
