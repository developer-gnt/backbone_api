import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entity/transaction.entity';
import { Users } from 'src/user/entities/user.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async create(dto: CreateTransactionDto, user: Users): Promise<Transaction> {
    const transaction = this.transactionRepo.create(dto);
    // transaction.created_by = user.id;
    transaction.created_on = Math.floor(Date.now() / 1000);

    return await this.transactionRepo.save(transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return await this.transactionRepo.find();
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepo.findOneBy({ id });
    if (!transaction)
      throw new NotFoundException(`Transaction with id ${id} not found`);
    return transaction;
  }

  async update(
    id: string,
    dto: UpdateTransactionDto,
    user: Users,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepo.findOneBy({ id });
    if (!transaction)
      throw new NotFoundException(`Transaction with id ${id} not found`);
    await this.transactionRepo.update(id, {
      ...dto,
      //   modified_by: user.id,
      modified_on: Math.floor(Date.now() / 1000),
    });

    return await this.transactionRepo.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.transactionRepo.delete(id);
  }
}
