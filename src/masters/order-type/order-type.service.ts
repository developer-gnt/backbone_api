import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderTypeDto } from './dto/create-order-type.dto';
import { UpdateOrderTypeDto } from './dto/update-order-type.dto';
import { OrderType } from './entity/order-type.entity';
import { Users } from 'src/user/entities/user.entity';

@Injectable()
export class OrderTypeService {
  constructor(
    @InjectRepository(OrderType)
    private readonly orderTypeRepo: Repository<OrderType>,
  ) {}

  async create(dto: CreateOrderTypeDto, user: Users): Promise<OrderType> {
    const orderType = this.orderTypeRepo.create(dto);
    // orderType.created_by = user.id;
    orderType.created_on = Math.floor(Date.now() / 1000);
    return await this.orderTypeRepo.save(orderType);
  }

  async findAll(): Promise<OrderType[]> {
    return await this.orderTypeRepo.find({ where: { deleted: false } });
  }

  async findOne(id: string): Promise<OrderType> {
    const orderType = await this.orderTypeRepo.findOneBy({ id });
    if (!orderType)
      throw new NotFoundException(`OrderType with id ${id} not found`);
    return orderType;
  }

  async update(
    id: string,
    dto: UpdateOrderTypeDto,
    user: Users,
  ): Promise<OrderType> {
    const orderType = await this.orderTypeRepo.findOneBy({ id });
    if (!orderType)
      throw new NotFoundException(`OrderType with id ${id} not found`);
    await this.orderTypeRepo.update(id, {
      ...dto,
      // modified_by: user.id,
      modified_on: Math.floor(Date.now() / 1000),
    });
    return await this.orderTypeRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<OrderType> {
    const ref = await this.orderTypeRepo.findOneBy({ id });
    if (!ref) throw new NotFoundException(`order type with id ${id} not found`);
    await this.orderTypeRepo.update(id, { deleted: true });
    return await this.orderTypeRepo.findOne({ where: { id } });
  }
}
