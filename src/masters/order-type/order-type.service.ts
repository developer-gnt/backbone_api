import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderTypeDto } from './dto/create-order-type.dto';
import { UpdateOrderTypeDto } from './dto/update-order-type.dto';
import { OrderType } from './entity/order-type.entity';

@Injectable()
export class OrderTypeService {
  constructor(
    @InjectRepository(OrderType)
    private readonly orderTypeRepo: Repository<OrderType>,
  ) {}

  async create(dto: CreateOrderTypeDto): Promise<OrderType> {
    const orderType = this.orderTypeRepo.create(dto);
    return await this.orderTypeRepo.save(orderType);
  }

  async findAll(): Promise<OrderType[]> {
    return await this.orderTypeRepo.find();
  }

  async findOne(id: string): Promise<OrderType> {
    const orderType = await this.orderTypeRepo.findOneBy({ id });
    if (!orderType)
      throw new NotFoundException(`OrderType with id ${id} not found`);
    return orderType;
  }

  async update(id: string, dto: UpdateOrderTypeDto): Promise<OrderType> {
    const orderType = await this.orderTypeRepo.findOneBy({ id });
    if (!orderType)
      throw new NotFoundException(`OrderType with id ${id} not found`);
    await this.orderTypeRepo.update(id, dto);
    return await this.orderTypeRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.orderTypeRepo.delete(id);
  }
}
