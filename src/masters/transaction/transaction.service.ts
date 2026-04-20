import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entity/transaction.entity';
import { Users } from 'src/user/entities/user.entity';
import { getNextNumericId } from 'src/utils/manual-id.util';
import { emailTransporter } from 'src/packages/nodemailer/transporter';

@Injectable()
export class TransactionService {
  private readonly razorpayKeyId =
    process.env.RAZORPAY_KEY_ID || 'rzp_test_dJIiLIWOFfMR5A';

  private readonly razorpayKeySecret =
    process.env.RAZORPAY_KEY_SECRET || 'O31j2mgeUb6LTbsGAf8vvCFs';

  private splitEmails(value?: string | null) {
    return `${value ?? ''}`
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private async sendCreditLoadedEmail(user: Users, updatedBalance: number) {
    const smtpConfigured = Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD,
    );

    if (!smtpConfigured) {
      return;
    }

    const sendmail = `${user.sendmail ?? ''}`.trim().toLowerCase();
    const primaryEmail = `${user.email ?? ''}`.trim();
    const alternateEmail = `${user.altmail ?? ''}`.trim();
    const to =
      sendmail === 'yes' || sendmail === ''
        ? primaryEmail || alternateEmail
        : alternateEmail || primaryEmail;

    if (!to) {
      return;
    }

    const name = `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() ||
      user.username ||
      'Client';

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      cc: this.splitEmails(user.cc),
      bcc: Array.from(
        new Set([
          ...this.splitEmails(user.bcc),
          process.env.SMTP_NOTIFY_TO || process.env.SMTP_FROM || process.env.SMTP_USER,
        ].filter(Boolean)),
      ),
      subject: 'Backbone Data Solutions-Credits Loaded',
      html: `<div><p>Hello ${name}!!,<br/><br/>Thank you for purchasing credits and your request has been successfully processed.<br/><br/>The available balance is ${updatedBalance} credits.<br/><br/>Thank you for your business!!</p><p>Thank you,<br/><br/><b>Backbone Data Solutions Team</b><br/><b>+1 (760) 376-5994</b></p></div>`,
    });
  }

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    private readonly dataSource: DataSource,
  ) {}

  async createCheckoutOrder(body: {
    amount?: string | number;
    contact?: string;
    name?: string;
    product?: string;
    email?: string;
  }) {
    const amountValue = Number(body.amount ?? 0);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      throw new BadRequestException('A valid payment amount is required.');
    }

    const amountInPaise = Math.round(amountValue * 100);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${this.razorpayKeyId}:${this.razorpayKeySecret}`,
        ).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        payment_capture: 1,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          id?: string;
          amount?: number;
          currency?: string;
          error?: { description?: string };
        }
      | null;

    if (!response.ok || !payload?.id) {
      throw new BadRequestException(
        payload?.error?.description ||
          'Unable to create the Razorpay checkout order.',
      );
    }

    return {
      keyId: this.razorpayKeyId,
      orderId: payload.id,
      amount: payload.amount ?? amountInPaise,
      currency: payload.currency || 'INR',
      contact: `${body.contact ?? ''}`.trim(),
      name: `${body.name ?? 'Backbone Data Solutions'}`.trim(),
      product: `${body.product ?? 'Checkout Payment'}`.trim(),
      email: `${body.email ?? ''}`.trim(),
    };
  }

  async verifyCheckout(body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  }) {
    const orderId = `${body.razorpay_order_id ?? ''}`.trim();
    const paymentId = `${body.razorpay_payment_id ?? ''}`.trim();
    const signature = `${body.razorpay_signature ?? ''}`.trim();

    if (!orderId || !paymentId || !signature) {
      throw new BadRequestException('Missing Razorpay payment verification fields.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return {
      verified: expectedSignature === signature,
      orderId,
      paymentId,
    };
  }

  async create(dto: CreateTransactionDto, user: Users): Promise<Transaction> {
    const owner = await this.userRepo.findOne({
      where: { id: Number(dto.registration_id) },
    });

    if (!owner) {
      throw new NotFoundException('Registration not found for transaction');
    }

    const nextId = await getNextNumericId(this.transactionRepo);

    const transaction = this.transactionRepo.create({
      id: nextId,
      amount: Number(dto.amount || 0),
      transaction_id: dto.transaction_id || '0',
      createdby: owner.username,
      created_date: new Date(),
      status: dto.status || 'Pending',
      mode: dto.mode || 'Credit',
      credits: Number(dto.credits || 0),
      paymentid: null,
      orderid: null,
    });

    return this.transactionRepo.save(transaction);
  }

  async findAll(status?: string): Promise<Transaction[]> {
    const where = status ? { status } : {};
    return this.transactionRepo.find({ where, order: { id: 'DESC' } });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepo.findOneBy({ id: Number(id) });
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    return transaction;
  }

  async update(
    id: string,
    dto: UpdateTransactionDto,
    user: Users,
  ): Promise<Transaction> {
    await this.findOne(id);
    const payload: Partial<Transaction> = {
      amount: dto.amount !== undefined ? Number(dto.amount) : undefined,
      transaction_id: dto.transaction_id,
      status: dto.status,
      mode: dto.mode,
      credits: dto.credits !== undefined ? Number(dto.credits) : undefined,
    };
    await this.transactionRepo.update(Number(id), payload);
    return this.findOne(id);
  }

  async approve(id: string): Promise<Transaction> {
    const result = await this.dataSource.transaction(async (manager) => {
      const txRepo = manager.getRepository(Transaction);
      const userRepo = manager.getRepository(Users);

      const transaction = await txRepo.findOne({ where: { id: Number(id) } });
      if (!transaction) {
        throw new NotFoundException(`Transaction with id ${id} not found`);
      }

      if (['Approved', 'Success'].includes(transaction.status)) {
        return { transaction, user: null as Users | null, updatedBalance: null as number | null };
      }

      const user = await userRepo.findOne({
        where: [{ username: transaction.createdby }, { email: transaction.createdby }],
      });

      if (!user) {
        throw new NotFoundException('Registration not found for transaction');
      }

      const updatedBalance =
        Number(user.wallete_balance || 0) + Number(transaction.credits || 0);

      await userRepo.update(user.id, {
        wallete_balance: updatedBalance,
      });

      await txRepo.update(transaction.id, { status: 'Success' });
      const updatedTransaction = await txRepo.findOne({ where: { id: transaction.id } });

      if (!updatedTransaction) {
        throw new NotFoundException(`Transaction with id ${id} not found`);
      }

      return { transaction: updatedTransaction, user, updatedBalance };
    });

    if (result.user && result.updatedBalance !== null) {
      try {
        await this.sendCreditLoadedEmail(result.user, result.updatedBalance);
      } catch {
        // Keep approve flow successful even if outbound email fails.
      }
    }

    return result.transaction;
  }

  async remove(id: string): Promise<any> {
    const transaction = await this.findOne(id);
    await this.transactionRepo.delete(Number(id));
    return {
      message: 'Transaction is deleted',
      data: transaction,
    };
  }
}
