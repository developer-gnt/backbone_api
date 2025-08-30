import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entity/package.entity';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
  ) {}

  async create(dto: CreatePackageDto): Promise<Package> {
    const pack = this.packageRepo.create(dto);
    return await this.packageRepo.save(pack);
  }

  async findAll(): Promise<Package[]> {
    return await this.packageRepo.find();
  }

  async findOne(id: string): Promise<Package> {
    const pack = await this.packageRepo.findOneBy({ id });
    if (!pack) throw new NotFoundException(`Package with id ${id} not found`);
    return pack;
  }

  async update(id: string, dto: UpdatePackageDto): Promise<Package> {
    const pack = await this.packageRepo.findOneBy({ id });
    if (!pack) throw new NotFoundException(`Package with id ${id} not found`);
    await this.packageRepo.update(id, dto);
    return await this.packageRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.packageRepo.delete(id);
  }
}
