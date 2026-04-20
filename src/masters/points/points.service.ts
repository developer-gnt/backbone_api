import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePointDto } from './dto/create-points.dto';
import { UpdatePointDto } from './dto/update-points.dto';
import { Users } from 'src/user/entities/user.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  private async findRegistration(dto: {
    registration_id?: number;
    username?: string;
  }) {
    const normalizedUsername = `${dto.username ?? ''}`.trim();

    if (
      dto.registration_id !== undefined &&
      dto.registration_id !== null &&
      `${dto.registration_id}`.trim() !== ''
    ) {
      const registration = await this.userRepository.findOne({
        where: { id: Number(dto.registration_id) },
      });

      if (registration) {
        return registration;
      }
    }

    if (normalizedUsername) {
      const registration = await this.userRepository.findOne({
        where: [{ username: normalizedUsername }, { email: normalizedUsername }],
      });

      if (registration) {
        return registration;
      }
    }

    throw new NotFoundException('Registration not found');
  }

  async create(dto: CreatePointDto, user: Users) {
    const registration = await this.findRegistration(dto);
    const pointsToAdd = Number(dto.points ?? 0);

    if (!Number.isFinite(pointsToAdd) || pointsToAdd < 0) {
      throw new BadRequestException('Please provide a valid points value');
    }

    const updatedPoints = Number(registration.points || 0) + pointsToAdd;
    await this.userRepository.update(registration.id, { points: updatedPoints });

    return {
      message: 'Points Add Successfully',
      data: await this.userRepository.findOne({ where: { id: registration.id } }),
    };
  }

  async findAll() {
    return this.userRepository.find({ order: { id: 'DESC' } });
  }

  async findOne(id: string) {
    const registration = await this.userRepository.findOne({
      where: { id: Number(id) },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return {
      id: registration.id,
      username: registration.username,
      wallete_balance: registration.wallete_balance,
      points: registration.points,
    };
  }

  async update(id: string, dto: UpdatePointDto, user: Users) {
    const registration = await this.userRepository.findOne({
      where: { id: Number(id) },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const nextPoints =
      dto.points !== undefined ? Number(dto.points) : Number(registration.points || 0);
    const nextWallet =
      dto.wallet_amount !== undefined
        ? Number(registration.wallete_balance || 0) + Number(dto.wallet_amount)
        : Number(registration.wallete_balance || 0);

    await this.userRepository.update(registration.id, {
      points: nextPoints,
      wallete_balance: nextWallet,
    });

    return this.findOne(id);
  }

  async convertBonusCredit(dto: CreatePointDto) {
    const registration = await this.findRegistration(dto);
    const currentPoints = Number(registration.points || 0);
    const pointsToDeduct = 100;
    const walletCredit = 10;

    await this.userRepository.update(registration.id, {
      points: currentPoints - pointsToDeduct,
      wallete_balance: Number(registration.wallete_balance || 0) + walletCredit,
    });

    return {
      message: 'Credit Add Successfully',
      data: await this.findOne(`${registration.id}`),
    };
  }

  async convert(id: string, dto: CreatePointDto) {
    const registration = await this.userRepository.findOne({
      where: { id: Number(id) },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const currentPoints = Number(registration.points || 0);
    const pointsToConvert = Number(dto.points || 0);

    if (pointsToConvert > currentPoints) {
      throw new NotFoundException('Insufficient points for conversion');
    }

    await this.userRepository.update(registration.id, {
      points: currentPoints - pointsToConvert,
      wallete_balance:
        Number(registration.wallete_balance || 0) + Number(dto.wallet_amount || 0),
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<any> {
    return this.findOne(id);
  }
}
