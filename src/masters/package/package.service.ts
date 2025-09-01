import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entity/package.entity';
import { Users } from 'src/user/entities/user.entity';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
  ) {}

  async create(dto: CreatePackageDto, user: Users): Promise<Package> {
    const pack = this.packageRepo.create(dto);
    pack.created_on = Math.floor(Date.now() / 1000);
    return await this.packageRepo.save(pack);
  }

  async findAll(): Promise<Package[]> {
    return await this.packageRepo.find({ where: { deleted: false } });
  }

  async findOne(id: string): Promise<Package> {
    const pack = await this.packageRepo.findOneBy({ id });
    if (!pack) throw new NotFoundException(`Package with id ${id} not found`);
    return pack;
  }

  async update(
    id: string,
    dto: UpdatePackageDto,
    user: Users,
  ): Promise<Package> {
    const pack = await this.packageRepo.findOneBy({ id });
    if (!pack) throw new NotFoundException(`Package with id ${id} not found`);
    await this.packageRepo.update(id, {
      ...dto,
      // modified_by: user.id,
      modified_on: Math.floor(Date.now() / 1000),
    });
    return await this.packageRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<Package> {
    const ref = await this.packageRepo.findOneBy({ id });
    if (!ref) throw new NotFoundException(`package with id ${id} not found`);
    await this.packageRepo.update(id, { deleted: true });
    return await this.packageRepo.findOne({ where: { id } });
  }
}
