import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import * as checkoutNodeJssdk from '@paypal/checkout-server-sdk';


import { Users } from 'src/user/entities/user.entity';

import { getNextNumericId } from 'src/utils/manual-id.util';
import { emailTransporter } from 'src/packages/nodemailer/transporter';
import { paypalClient } from 'src/paypal/paypal.client';
import { Transaction } from './entity/transaction.entity';

@Injectable()
export class PaypalPaymentService {
    private readonly paypal = paypalClient();
    private splitEmails(value?: string | null) {
        return `${value ?? ''}`
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
    }
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,

        @InjectRepository(Users)
        private readonly userRepo: Repository<Users>,

        private readonly dataSource: DataSource,
    ) { }
}