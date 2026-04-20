import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderTypeDto } from './dto/create-order-type.dto';
import { UpdateOrderTypeDto } from './dto/update-order-type.dto';
import { OrderType } from './entity/order-type.entity';
import { Users } from 'src/user/entities/user.entity';
import { getNextNumericId } from 'src/utils/manual-id.util';

@Injectable()
export class OrderTypeService {
  constructor(
    @InjectRepository(OrderType)
    private readonly orderTypeRepo: Repository<OrderType>,
  ) {}

  async create(dto: CreateOrderTypeDto, user: Users): Promise<any> {
    const requestedId =
      dto.id !== undefined && dto.id !== null ? Number(dto.id) : null;
    const nextId = requestedId || (await getNextNumericId(this.orderTypeRepo));

    const existing = await this.orderTypeRepo.findOneBy({ id: nextId });
    if (existing) {
      throw new BadRequestException('Sequence number already exists');
    }

    const orderType = this.orderTypeRepo.create({
      id: nextId,
      order_type: dto.order_type,
    });
    await this.orderTypeRepo.save(orderType);

    return {
      message: 'Order Type Add Successfully',
      data: orderType,
    };
  }

  async findAll(): Promise<OrderType[]> {
    return this.orderTypeRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string): Promise<OrderType> {
    const orderType = await this.orderTypeRepo.findOneBy({ id: Number(id) });
    if (!orderType)
      throw new NotFoundException(`OrderType with id ${id} not found`);
    return orderType;
  }

  async update(
    id: string,
    dto: UpdateOrderTypeDto,
    user: Users,
  ): Promise<any> {
    await this.findOne(id);
    await this.orderTypeRepo.update(Number(id), {
      order_type: dto.order_type,
    });

    return {
      message: 'Order Type Updated Successfully',
      data: await this.findOne(id),
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.orderTypeRepo.delete(Number(id));
      return {
        message: 'Order type deleted successfully',
      };
    } catch {
      throw new BadRequestException(
        'Unable to delete this order type right now. It may still be referenced elsewhere.',
      );
    }
  }
}
