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
import { Transaction } from '../transaction/entity/transaction.entity';
import { getNextNumericId } from 'src/utils/manual-id.util';

import { PointTransaction } from './entity/point-transaction.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepo: Repository<PointTransaction>,
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

  async addReviewPoints(dto: CreatePointDto, user: Users) {
    const registration = await this.findRegistration(dto);
    const pointsToAdd = Number(dto.points ?? 0);

    if (!Number.isFinite(pointsToAdd) || pointsToAdd < 0) {
      throw new BadRequestException('Please provide a valid points value');
    }

    const updatedFeedbackPoints = Number(registration.feedback_points || 0) + pointsToAdd;
    await this.userRepository.update(registration.id, { feedback_points: updatedFeedbackPoints });

    await this.logPointTransaction({
      user_id: Number(registration.id),
      points_change: pointsToAdd,
      type: 'REVIEW_POINTS',
      description: 'From Data solution team ',
    });

    return {
      message: 'Review Points Added Successfully',
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

  async clientRedeem(user: Users) {
    const registration = await this.userRepository.findOne({
      where: { id: Number(user.id) },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const currentPoints = Number(registration.feedback_points || 0);

    if (currentPoints < 10) {
      throw new BadRequestException('You need at least 10 feedback points to redeem.');
    }

    const pointsToRedeem = currentPoints;

    await this.userRepository.update(registration.id, {
      feedback_points: 0,
      wallete_balance: Number(registration.wallete_balance || 0) + pointsToRedeem,
    });

    const nextTxId = await getNextNumericId(this.transactionRepo);
    await this.transactionRepo.save(
      this.transactionRepo.create({
        id: nextTxId,
        amount: pointsToRedeem,
        transaction_id: `REDEEM-FEEDBACK-${registration.id}-${Date.now()}`,
        createdby: registration.username || registration.email || `Client ${registration.id}`,
        created_date: new Date(),
        status: 'Approved',
        mode: 'Credit',
        credits: pointsToRedeem,
        paymentid: null,
        orderid: null,
      }),
    );

    await this.logPointTransaction({
      user_id: Number(registration.id),
      points_change: -pointsToRedeem,
      type: 'REDEEMED',
      description: `Redeemed ${pointsToRedeem} points for wallet credit`,
    });

    return {
      message: `${pointsToRedeem} points successfully redeemed for $${pointsToRedeem.toFixed(2)} wallet credit!`,
      data: await this.findOne(`${registration.id}`),
    };
  }
  async logPointTransaction(data: {
    user_id: number;
    points_change: number;
    type: string;
    description?: string;
    order_id?: number;
  }) {
    await this.pointTransactionRepo.save(this.pointTransactionRepo.create(data));
  }

  async getClientHistory(user: Users) {
    return this.pointTransactionRepo.find({
      where: { user_id: Number(user.id) },
      order: { created_date: 'DESC' },
    });
  }
}
