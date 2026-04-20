import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
  ): Promise<any> {
    const alert = this.alertRepo.create(dto);
    const saved = await this.alertRepo.save(alert);

    return {
      message: 'updation done successfully',
      data: saved,
    };
  }

  async findAll(): Promise<AlertAvailability[]> {
    return this.alertRepo.find({ order: { package: 'ASC' } });
  }

  async findOne(packageName: string): Promise<AlertAvailability> {
    const alert = await this.alertRepo.findOneBy({ package: packageName });
    if (!alert)
      throw new NotFoundException(
        `Availability message for package ${packageName} not found`,
      );
    return alert;
  }

  async update(
    packageName: string,
    dto: UpdateAlertAvailabilityDto,
    user: Users,
  ): Promise<any> {
    const targetPackage = dto.package || packageName;

    await this.alertRepo.save({
      package: targetPackage,
      msg: dto.msg,
    });

    return {
      message: 'updation done successfully',
      data: await this.findOne(targetPackage),
    };
  }

  async remove(packageName: string) {
    await this.findOne(packageName);

    try {
      await this.alertRepo.delete({ package: packageName });
      return {
        message: 'Availability alert deleted successfully',
      };
    } catch {
      throw new BadRequestException(
        'Unable to delete this availability alert right now. It may still be referenced elsewhere.',
      );
    }
  }
}
