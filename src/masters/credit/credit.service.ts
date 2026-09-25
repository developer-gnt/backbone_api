import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';
import { Users } from 'src/user/entities/user.entity';
import { Transaction } from '../transaction/entity/transaction.entity';
import { Package } from '../package/entity/package.entity';
import { getNextNumericId } from 'src/utils/manual-id.util';
import { emailTransporter } from 'src/packages/nodemailer/transporter';

@Injectable()
export class CreditService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
    private readonly dataSource: DataSource,
  ) { }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private parseNumericId(value: unknown, label: string) {
    const parsed = Number(value);

    if (
      value === undefined ||
      value === null ||
      `${value}`.trim() === '' ||
      !Number.isFinite(parsed)
    ) {
      throw new BadRequestException(`A valid ${label} is required`);
    }

    return parsed;
  }

  private async sendCreditAddedEmail(payload: {
    email?: string | null;
    firstName?: string | null;
    credits: number;
    updatedBalance: number;
  }) {
    const recipient = `${payload.email ?? ''}`.trim();

    if (!recipient) {
      return { previewMode: true, sent: false };
    }

    const smtpConfigured = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD,
    );

    if (!smtpConfigured) {
      return { previewMode: true, sent: false };
    }

    const safeName = this.escapeHtml(payload.firstName?.trim() || 'Client');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <p>Hello ${safeName},</p>
        <p>
          We have added <b>${payload.credits}</b> credits and your updated balance is
          <b>${payload.updatedBalance}</b> credits in your account.
        </p>
        <p>
          Please review your account and do let us know if you have any questions.<br />
          Thank you for your business and we look forward to a healthy relationship.
        </p>
        <p style="margin-top: 24px;">
          Thank you,<br /><br />
          <b>Backbone Data Solutions Team</b><br />
          <b>+1 (760) 376-5994</b>
        </p>
      </div>
    `;

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipient,
      bcc: process.env.SMTP_NOTIFY_TO || '',
      subject: 'Congratulations💥- Credits Added',
      html,
    });

    return { previewMode: false, sent: true };
  }

  private async sendCreditDeductedEmail(payload: {
    email?: string | null;
    firstName?: string | null;
    credits: number;
    updatedBalance: number;
  }) {
    const recipient = `${payload.email ?? ''}`.trim();

    if (!recipient) {
      return { previewMode: true, sent: false };
    }

    const smtpConfigured = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD,
    );

    if (!smtpConfigured) {
      return { previewMode: true, sent: false };
    }

    const safeName = this.escapeHtml(payload.firstName?.trim() || 'Client');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <p>Hello ${safeName},</p>
        <p>
          <b>${payload.credits}</b> credits have been deducted from your account. Your updated balance is
          <b>${payload.updatedBalance}</b> credits.
        </p>
        <p>
          Please review your account and do let us know if you have any questions.<br />
          Thank you for your business and we look forward to a healthy relationship.
        </p>
        <p style="margin-top: 24px;">
          Thank you,<br /><br />
          <b>Backbone Data Solutions Team</b><br />
          <b>+1 (760) 376-5994</b>
        </p>
      </div>
    `;

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipient,
      subject: 'Notice - Credits Deducted',
      html,
    });

    return { previewMode: false, sent: true };
  }

  async create(dto: CreateCreditDto, user: Users) {
    return this.addCredit(dto);
  }

  async addCredit(dto: CreateCreditDto) {
    const normalizedId = Number(dto.registration_id);
    const hasValidRegistrationId =
      dto.registration_id !== undefined &&
      dto.registration_id !== null &&
      `${dto.registration_id}`.trim() !== '' &&
      Number.isFinite(normalizedId);
    const normalizedUsername = `${dto.username ?? ''}`.trim();
    const creditAmount = Number(dto.credits ?? 0);

    if (!Number.isFinite(creditAmount) || creditAmount < 0) {
      throw new BadRequestException('A valid credit amount is required');
    }

    if (!hasValidRegistrationId && !normalizedUsername) {
      throw new BadRequestException(
        'Please provide a valid registration id or user name',
      );
    }

    const registration = await this.userRepo.findOne({
      where: hasValidRegistrationId
        ? { id: normalizedId }
        : [{ username: normalizedUsername }, { email: normalizedUsername }],
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const users = manager.getRepository(Users);
      const transactions = manager.getRepository(Transaction);

      const updatedBalance =
        Number(registration.wallete_balance || 0) + creditAmount;

      await users.update(registration.id, {
        wallete_balance: updatedBalance,
      });

      const nextId = await getNextNumericId(transactions);

      const transaction = transactions.create({
        id: nextId,
        amount: creditAmount,
        transaction_id: 'Bonus',
        createdby: registration.username || registration.email,
        created_date: new Date(),
        status: 'Success',
        mode: 'Credit',
        credits: creditAmount,
        paymentid: null,
        orderid: null,
      });

      const savedTransaction = await transactions.save(transaction);

      return {
        message: 'Credit Add Successfully',
        wallete_balance: updatedBalance,
        transaction: savedTransaction,
        registration,
      };
    });

    try {
      await this.sendCreditAddedEmail({
        email: result.registration.email,
        firstName: result.registration.firstname,
        credits: creditAmount,
        updatedBalance: Number(result.wallete_balance || 0),
      });
    } catch {
      // Keep credit flow successful even if outbound email is unavailable.
    }

    return result;
  }

  async deductCredit(dto: CreateCreditDto) {
    const normalizedId = Number(dto.registration_id);
    const hasValidRegistrationId =
      dto.registration_id !== undefined &&
      dto.registration_id !== null &&
      `${dto.registration_id}`.trim() !== '' &&
      Number.isFinite(normalizedId);
    const normalizedUsername = `${dto.username ?? ''}`.trim();
    const creditAmount = Number(dto.credits ?? 0);

    if (!Number.isFinite(creditAmount) || creditAmount <= 0) {
      throw new BadRequestException('A valid deduction amount is required');
    }

    if (!hasValidRegistrationId && !normalizedUsername) {
      throw new BadRequestException(
        'Please provide a valid registration id or user name',
      );
    }

    const registration = await this.userRepo.findOne({
      where: hasValidRegistrationId
        ? { id: normalizedId }
        : [{ username: normalizedUsername }, { email: normalizedUsername }],
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const currentBalance = Number(registration.wallete_balance || 0);

    if (currentBalance < creditAmount) {
      throw new BadRequestException(`Insufficient credits. Current balance is ${currentBalance}`);
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const users = manager.getRepository(Users);
      const transactions = manager.getRepository(Transaction);

      const updatedBalance = currentBalance - creditAmount;

      await users.update(registration.id, {
        wallete_balance: updatedBalance,
      });

      const nextId = await getNextNumericId(transactions);

      const transaction = transactions.create({
        id: nextId,
        amount: creditAmount,
        transaction_id: 'Deduction',
        createdby: registration.username || registration.email,
        created_date: new Date(),
        status: 'Success',
        mode: 'Debit',
        credits: 0,
        paymentid: null,
        orderid: null,
      });

      const savedTransaction = await transactions.save(transaction);

      return {
        message: 'Credit Deducted Successfully',
        wallete_balance: updatedBalance,
        transaction: savedTransaction,
        registration,
      };
    });

    try {
      await this.sendCreditDeductedEmail({
        email: result.registration.email,
        firstName: result.registration.firstname,
        credits: creditAmount,
        updatedBalance: Number(result.wallete_balance || 0),
      });
    } catch {
      // Keep credit flow successful even if outbound email is unavailable.
    }

    return result;
  }

  private async sendPackageLoadedEmail(payload: {
    user: Users;
    updatedBalance: number;
  }) {
    const smtpConfigured = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD,
    );

    if (!smtpConfigured) {
      return { previewMode: true, sent: false };
    }

    const sendMailPreference = `${payload.user.sendmail ?? ''}`.trim().toLowerCase();
    const primaryEmail = `${payload.user.email ?? ''}`.trim();
    const alternateEmail = `${payload.user.altmail ?? ''}`.trim();
    const to =
      sendMailPreference === 'yes' || sendMailPreference === ''
        ? primaryEmail || alternateEmail
        : alternateEmail || primaryEmail;

    if (!to) {
      return { previewMode: true, sent: false };
    }

    const cc = `${payload.user.cc ?? ''}`
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const bcc = `${payload.user.bcc ?? ''}`
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const safeName = this.escapeHtml(
      `${payload.user.firstname ?? ''} ${payload.user.lastname ?? ''}`.trim() ||
      payload.user.username ||
      'Client',
    );

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      cc: cc.length ? cc : undefined,
      bcc: [
        ...bcc,
        process.env.SMTP_ORDER_NOTIFY_TO || process.env.SMTP_FROM || process.env.SMTP_USER,
      ].filter(Boolean),
      subject: 'Backbone Data Solutions-Credits Loaded',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <p>Hello ${safeName}!!,</p>
          <p>
            Thank you for purchasing credits and your request has been successfully processed.<br />
            The available balance is <b>${payload.updatedBalance}</b> credits.<br /><br />
            Thank you for your business!!
          </p>
          <p>
            Thank you,<br /><br />
            <b>Backbone Data Solutions Team</b><br />
            <b>+1 (760) 376-5994</b>
          </p>
        </div>
      `,
    });

    return { previewMode: false, sent: true };
  }

  async addTransaction(dto: {
    registration_id?: number;
    username?: string;
    package_id: number;
    remarks?: string;
  }) {
    const normalizedUsername = `${dto.username ?? ''}`.trim();
    const hasRegistrationId =
      dto.registration_id !== undefined &&
      dto.registration_id !== null &&
      `${dto.registration_id}`.trim() !== '';
    const registrationId = hasRegistrationId
      ? this.parseNumericId(dto.registration_id, 'registration id')
      : null;
    const packageId = this.parseNumericId(dto.package_id, 'package id');

    if (!registrationId && !normalizedUsername) {
      throw new BadRequestException(
        'Please provide a valid registration id or user name',
      );
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const users = manager.getRepository(Users);
      const transactions = manager.getRepository(Transaction);
      const packages = manager.getRepository(Package);

      const registration = await users.findOne({
        where: registrationId
          ? { id: registrationId }
          : [{ username: normalizedUsername }, { email: normalizedUsername }],
      });
      if (!registration) {
        throw new NotFoundException('Registration not found');
      }

      const pack = await packages.findOne({
        where: { id: packageId },
      });
      if (!pack) {
        throw new NotFoundException('Package not found');
      }

      const packageCredit = Number(pack.credit || 0);
      const updatedBalance =
        Number(registration.wallete_balance || 0) + packageCredit;

      await users.update(registration.id, {
        wallete_balance: updatedBalance,
      });

      const nextId = await getNextNumericId(transactions);

      const transaction = transactions.create({
        id: nextId,
        amount: Number(pack.price || 0),
        transaction_id: '0',
        createdby: registration.username || registration.email,
        created_date: new Date(),
        status: 'Success',
        mode: 'Credit',
        credits: packageCredit,
        paymentid: null,
        orderid: `${packageId}`,
      });

      const savedTransaction = await transactions.save(transaction);

      return {
        message: 'Transaction Add Successfully',
        wallete_balance: updatedBalance,
        transaction: savedTransaction,
        registration,
      };
    });

    try {
      await this.sendPackageLoadedEmail({
        user: result.registration,
        updatedBalance: Number(result.wallete_balance || 0),
      });
    } catch {
      // Keep transaction flow successful even if outbound email is unavailable.
    }

    return result;
  }

  async findAll() {
    return this.transactionRepo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: string) {
    const transactionId = this.parseNumericId(id, 'transaction id');
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    return transaction;
  }

  async update(id: string, dto: UpdateCreditDto, user: Users) {
    const registrationId = this.parseNumericId(id, 'registration id');
    const registration = await this.userRepo.findOne({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    await this.userRepo.update(registration.id, {
      wallete_balance: Number(
        dto.wallete_balance ?? registration.wallete_balance,
      ),
      points: Number(dto.points ?? registration.points),
      status: dto.status || registration.status,
    } as Partial<Users>);

    return this.userRepo.findOne({ where: { id: registration.id } });
  }

  async remove(id: string) {
    return this.findOne(id);
  }
}
