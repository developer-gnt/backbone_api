import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Users } from 'src/user/entities/user.entity';
import { getNextNumericId } from 'src/utils/manual-id.util';
import { Transaction } from '../transaction/entity/transaction.entity';
import { emailTransporter } from 'src/packages/nodemailer/transporter';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ChatMessage } from './entity/chat-message.entity';
import { CompletedDownload } from './entity/completed-download.entity';
import { Download } from './entity/download.entity';
import { Order } from './entity/order.entity';
import { TatPricingService } from '../tat-pricing/tat-pricing.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    @InjectRepository(Download)
    private readonly downloadRepo: Repository<Download>,
    @InjectRepository(CompletedDownload)
    private readonly completedDownloadRepo: Repository<CompletedDownload>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(ChatMessage)
    private readonly chatRepo: Repository<ChatMessage>,
    private readonly tatPricingService: TatPricingService,
    private readonly dataSource: DataSource,
  ) { }

  private toNullableNumber(value: unknown): number | null {
    if (value === undefined || value === null || `${value}`.trim() === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private toNumber(value: unknown): number {
    return this.toNullableNumber(value) ?? 0;
  }

  async create(
    dto: CreateOrderDto,
    user: Users,
    attachments: Array<{
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    }> = [],
  ) {
    const actor = await this.userRepo.findOne({
      where: { id: Number(user.id) },
    });

    if (!actor) {
      throw new NotFoundException('Authenticated user could not be found');
    }

    const requestedCreatedBy = dto.createdby?.trim();
    const createdForUser = requestedCreatedBy
      ? await this.userRepo.findOne({
        where: [
          { username: requestedCreatedBy },
          { email: requestedCreatedBy },
        ],
      })
      : null;

    const walletOwner =
      (actor.role ?? '').toLowerCase() === 'client'
        ? actor
        : (createdForUser?.role ?? '').toLowerCase() === 'client'
          ? createdForUser
          : null;

    if (
      (actor.role ?? '').toLowerCase() !== 'client' &&
      requestedCreatedBy &&
      !walletOwner
    ) {
      throw new BadRequestException(
        'Please enter a valid client username or email before placing the order.',
      );
    }

    const createdby =
      requestedCreatedBy ||
      walletOwner?.username ||
      walletOwner?.email ||
      actor.username ||
      actor.email ||
      `${actor.id}`;
    const defaultStatus =
      dto.status?.trim() ||
      ((actor.role ?? '').toLowerCase() === 'client' ? 'New Order' : 'Pending');

    const resolvedTat = await this.tatPricingService.resolveSelection(
      {
        clientId: walletOwner?.id,
        username: walletOwner?.username || walletOwner?.email,
      },
      {
        tatPackageId: dto.tat_package_id,
        packageCode: dto.package_code || dto.package,
        tatHours: dto.tat_hours ?? dto.package,
      },
    );
    const packageValue = `${resolvedTat.tatPackage.package_code ?? ''}`.trim();
    const debitAmount = Number(resolvedTat.effectivePrice ?? 0);

    if (!packageValue) {
      throw new BadRequestException('Package / ETA selection is required');
    }

    if (!`${dto.subject_address ?? ''}`.trim()) {
      throw new BadRequestException('Subject address is required');
    }

    if (walletOwner && debitAmount > Number(walletOwner.wallete_balance ?? 0)) {
      throw new BadRequestException(
        'You do not have enough wallet balance to place this order',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const orders = manager.getRepository(Order);
      const users = manager.getRepository(Users);
      const transactions = manager.getRepository(Transaction);

      const nextId = await getNextNumericId(orders);
      const now = new Date();
      const order = orders.create({
        id: nextId,
        createdby,
        package: packageValue,
        tat_package_id: Number(resolvedTat.tatPackage.id),
        package_code: resolvedTat.tatPackage.package_code,
        tat_hours: Number(resolvedTat.tatPackage.tat_hours ?? 0),
        charged_amount: debitAmount,
        status: defaultStatus,
        description: dto.description?.trim() || null,
        reply: dto.reply?.trim() || null,
        remark: dto.remark?.trim() || null,
        message: dto.message?.trim() || null,
        amount: debitAmount,
        created_date: now,
        order_type: dto.order_type?.trim() || null,
        reoform: dto.reoform?.trim() || null,
        non_uad: dto.non_uad?.trim() || null,
        financing: dto.financing?.trim() || null,
        borrower_name: dto.borrower_name?.trim() || null,
        subject_address: dto.subject_address?.trim() || null,
        subject_state: dto.subject_state?.trim() || null,
        subject_city: dto.subject_city?.trim() || null,
        subject_zipcode: dto.subject_zipcode?.trim() || null,
        subject_country: dto.subject_country?.trim() || null,
        order_type_comment: dto.order_type_comment?.trim() || null,
        standard_instruction:
          dto.standard_instruction?.trim() ||
          walletOwner?.std_instr ||
          actor.std_instr ||
          null,
        sketch: dto.sketch?.trim() || null,
        modifyby: createdby,
        modify_date: now,
      });

      const savedOrder = await orders.save(order);

      let updatedBalance = Number(
        walletOwner?.wallete_balance ?? actor.wallete_balance ?? 0,
      );

      if (walletOwner && debitAmount > 0) {
        updatedBalance -= debitAmount;

        await users.update(walletOwner.id, {
          wallete_balance: updatedBalance,
        });

        const nextTxId = await getNextNumericId(transactions);
        await transactions.save(
          transactions.create({
            id: nextTxId,
            amount: debitAmount,
            transaction_id: `ORDER-${savedOrder.id}`,
            createdby: walletOwner.username || walletOwner.email || createdby,
            created_date: now,
            status: 'Approved',
            mode: 'Debit',
            credits: 0,
            paymentid: null,
            orderid: `${savedOrder.id}`,
          }),
        );
      }

      if (attachments.length) {
        const attachmentTypes = Array.isArray(dto.attachmentTypes)
          ? dto.attachmentTypes
          : dto.attachmentTypes
            ? [dto.attachmentTypes]
            : [];

        await this.saveWorkingAttachments(
          manager,
          savedOrder.id,
          attachments,
          attachmentTypes,
        );
      }

      await this.sendOrderEmail({
        order: savedOrder,
        subject: `New Order File #${savedOrder.id} - ${savedOrder.subject_address ?? ''}`,
        html: `
    <div>
      <p>
        Hello ${savedOrder.createdby},
        <br/><br/>

        Thank you for placing your order with Backbone Data Solutions.

        <br/><br/>

        File #${savedOrder.id}

        <br/><br/>

        Address:
        ${savedOrder.subject_address ?? ''}

        <br/><br/>

        

        <br/><br/>

        We have successfully received your appraisal order.
        Our team has started processing it.

      </p>

      <p>
        Thank you,

        <br/><br/>

        <b>Backbone Data Solutions Team</b>

        <br/>

        +1 (760) 376-5994
      </p>

    </div>
  `,
      });

      return {
        message: 'Order created successfully',
        wallete_balance: updatedBalance,
        order: savedOrder,
      };
    });
  }

  async getOrders(filters?: { status?: string; createdby?: string }) {
    const where: Record<string, string> = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.createdby) {
      where.createdby = filters.createdby;
    }

    return this.orderRepo.find({
      where,
      order: { id: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({ where: { id: Number(id) } });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async checkDuplicateAddress(address?: string) {
    const normalized = `${address ?? ''}`.trim().toLowerCase();

    if (!normalized) {
      return { exists: false, count: 0 };
    }

    const count = await this.orderRepo
      .createQueryBuilder('order')
      .where(`LOWER(COALESCE(order.subject_address, '')) LIKE :address`, {
        address: `%${normalized}%`,
      })
      .getCount();

    return {
      exists: count > 0,
      count,
    };
  }

  async getMessages(id: string, user: Users) {
    const order = await this.ensureOrderAccess(id, user);

    const messages = await this.chatRepo.find({
      where: { order_id: order.id, createdby: order.createdby },
      order: { msg_time: 'ASC' },
    });

    const history = messages.map((item) => ({
      order_id: item.order_id,
      message: item.message,
      msg_frm: item.msg_frm || 'client',
      name:
        item.msg_frm === 'team'
          ? 'Backbone Data Solutions Team'
          : item.name || order.createdby,
      email: item.email || null,
      msg_time: item.msg_time,
    }));

    if (
      order.message &&
      !history.some((entry) => entry.message === order.message)
    ) {
      history.push({
        order_id: order.id,
        message: order.message,
        msg_frm: 'client',
        name: order.createdby || 'Client',
        email: null,
        msg_time: order.modify_date || order.created_date,
      });
    }

    if (
      order.reply &&
      !history.some((entry) => entry.message === order.reply)
    ) {
      history.push({
        order_id: order.id,
        message: order.reply,
        msg_frm: 'team',
        name: 'Backbone Data Solutions Team',
        email: null,
        msg_time: order.modify_date || order.created_date,
      });
    }

    history.sort(
      (a, b) =>
        new Date(a.msg_time ?? 0).getTime() -
        new Date(b.msg_time ?? 0).getTime(),
    );

    return {
      order: {
        id: order.id,
        status: order.status,
        subject_address: order.subject_address,
      },
      messages: history,
    };
  }

  async sendMessage(id: string, user: Users, message?: string) {
    const text = `${message ?? ''}`.trim();

    if (!text) {
      throw new BadRequestException('Message is required');
    }

    const order = await this.ensureOrderAccess(id, user);
    const senderRole =
      (user.role ?? '').toLowerCase() === 'client' ? 'client' : 'team';
    const senderName =
      senderRole === 'team'
        ? 'Backbone Data Solutions'
        : `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() ||
        user.username ||
        user.companyname ||
        'Client';

    await this.chatRepo.save(
      this.chatRepo.create({
        order_id: order.id,
        msg_time: new Date(),
        message: text,
        createdby: order.createdby,
        name: senderName,
        login_id: Number(user.id) || null,
        email: user.email || user.username || null,
        msg_frm: senderRole,
      }),
    );

    await this.orderRepo.update(order.id, {
      ...(senderRole === 'client' ? { message: text } : { reply: text }),
      modify_date: new Date(),
      modifyby: user.username || user.email || `${user.id}`,
    });

    if (senderRole === 'team') {
      const client = await this.findNotificationUser(order.createdby);
      const clientName =
        `${client?.firstname ?? ''} ${client?.lastname ?? ''}`.trim() ||
        client?.username ||
        order.createdby ||
        'Client';
      const address = order.subject_address || '';

      await this.sendOrderEmail({
        order,
        subject: `Message for file #${order.id} - ${address}`,
        html: `<div><table><tr><td><p>Hello ${clientName},<br /><br />File #-${order.id}<br /><br />Address-${address}<br /><br />Message-${text}<br /><br /></p><p>Thank you,<br /><br /><b>Backbone Data Solutions Support Team</b><br/><b>+1 (760) 376-5994</b></p></td></tr></table></div>`,
      });
    }

    return {
      message: 'Chat message sent successfully',
    };
  }

  private async findNotificationUser(createdby?: string | null) {
    const normalized = `${createdby ?? ''}`.trim();

    if (!normalized) {
      return null;
    }

    return this.userRepo.findOne({
      where: [{ email: normalized }, { username: normalized }],
    });
  }

  private splitEmails(value?: string | null) {
    return `${value ?? ''}`
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private async sendOrderEmail(options: {
    order: Order;
    subject: string;
    html: string;
    extraEmails?: string | null;
    attachments?: Array<{ filename?: string; path: string }>;
  }) {
    try {
      const client = await this.findNotificationUser(options.order.createdby);

      const to = new Set<string>();
      let clientCc = '';
      let clientBcc = '';

      if (client) {
        const sendmail = `${client.sendmail ?? ''}`.trim().toLowerCase();
        if ((sendmail === '' || sendmail === 'yes') && client.email) {
          to.add(client.email.trim());
        } else if (client.altmail?.trim()) {
          to.add(client.altmail.trim());
        }
        clientCc = client.cc || '';
        clientBcc = client.bcc || '';
      }

      this.splitEmails(options.extraEmails).forEach((email) => to.add(email));

      const bccList = Array.from(
        new Set([
          ...this.splitEmails(clientBcc),
          ...this.splitEmails(process.env.SMTP_BCC),
          process.env.SMTP_ORDER_NOTIFY_TO ||
          'orders@backbonedatasolutions.com',
        ]),
      );

      if (!to.size && !bccList.length) {
        return;
      }

      await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: Array.from(to),
        cc: this.splitEmails(clientCc),
        bcc: bccList,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });
    } catch (error) {
      console.log('[Order email notification failed]', error);
    }
  }

  private async saveWorkingAttachments(
    manager: EntityManager,
    orderId: number | string,
    attachments: Array<{
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    }>,
    attachmentTypes: string[] = [],
  ) {
    const downloads = manager.getRepository(Download);

    if (!attachments.length) {
      return [] as Download[];
    }

    const uploadDir = join(
      process.cwd(),
      'UplodedOrderFiles',
      'orders',
      `${orderId}`,
    );
    await mkdir(uploadDir, { recursive: true });

    let nextId = await getNextNumericId(downloads);
    const rows: Download[] = [];

    for (const [index, file] of attachments.entries()) {
      const safeName = this.sanitizeFilename(file.originalname);
      const targetPath = join(uploadDir, safeName);
      await writeFile(targetPath, file.buffer);

      rows.push(
        downloads.create({
          id: nextId++,
          order_id: `${orderId}`,
          type: attachmentTypes[index] || file.mimetype || 'Attachment',
          filename: file.originalname,
          date: new Date(),
          filepath: `/UplodedOrderFiles/orders/${orderId}/${safeName}`,
        }),
      );
    }

    if (rows.length) {
      await downloads.save(rows);
    }

    return rows;
  }

  private async saveCompletedAttachments(
    manager: EntityManager,
    orderId: number | string,
    attachments: Array<{
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    }>,
    replaceExisting = false,
  ) {
    const completedRepo = manager.getRepository(CompletedDownload);

    if (replaceExisting) {
      await completedRepo.delete({ order_id: `${orderId}` });
    }

    if (!attachments.length) {
      return [] as CompletedDownload[];
    }

    const uploadDir = join(
      process.cwd(),
      'UplodedOrderFiles',
      'orders',
      `${orderId}`,
      'completed',
    );
    await mkdir(uploadDir, { recursive: true });

    let nextId = await getNextNumericId(completedRepo);
    const rows: CompletedDownload[] = [];

    for (const file of attachments) {
      const safeName = this.sanitizeFilename(file.originalname);
      const targetPath = join(uploadDir, safeName);
      await writeFile(targetPath, file.buffer);

      rows.push(
        completedRepo.create({
          id: nextId++,
          order_id: `${orderId}`,
          type: file.mimetype || 'Completed Document',
          filename: file.originalname,
          date: new Date(),
          filepath: `/UplodedOrderFiles/orders/${orderId}/completed/${safeName}`,
        }),
      );
    }

    if (rows.length) {
      await completedRepo.save(rows);
    }

    return rows;
  }

  async startWork(id: string, message?: string) {
    const order = await this.findOne(id);
    const trimmedMessage = `${message ?? ''}`.trim();

    await this.orderRepo.update(Number(id), {
      status: 'Work In Progress',
      ...(trimmedMessage ? { reply: trimmedMessage } : {}),
      modify_date: new Date(),
    });

    if (trimmedMessage) {
      await this.chatRepo.save(
        this.chatRepo.create({
          order_id: order.id,
          msg_time: new Date(),
          message: trimmedMessage,
          createdby: order.createdby,
          name: 'Backbone Data Solutions Team',
          login_id: null,
          email: null,
          msg_frm: 'team',
        }),
      );

      const name = order.createdby || 'Client';
      const subAdd = order.subject_address || '';
      await this.sendOrderEmail({
        order,
        subject: `Work In Progress File #${order.id} - ${subAdd}`,
        html: `<div><p>Hello ${name},<br/><br/>Thanks for being with Backbone Data Solutions. Your order is now work in progress.<br/><br/>File #-${order.id}<br/><br/>Address: ${subAdd}<br/><br/>${trimmedMessage}</p><p>Thank you,<br/><br/><b>Backbone Data Solutions Team</b><br/><b>+1 (760) 376-5994</b></p></div>`,
      });
    }

    return this.findOne(id);
  }

  async completeOrder(
    id: string,
    body: {
      emp_remark?: string;
      complete_notification_email?: string;
      extra_emails?: string;
      summary_notes?: string;
      resend_remark?: string;
      replace_existing?: string;
    },
    attachments: Array<{
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    }> = [],
  ) {
    const order = await this.findOne(id);
    const replaceExisting =
      `${body.replace_existing ?? ''}`.trim().toLowerCase() === 'true';
    const remark = `${body.emp_remark ?? body.resend_remark ?? ''}`.trim();
    const sendCompletedEmail =
      `${body.complete_notification_email ?? 'Yes'}`.trim() || 'Yes';

    await this.dataSource.transaction(async (manager) => {
      const orders = manager.getRepository(Order);
      const users = manager.getRepository(Users);
      const client = await this.findNotificationUser(order.createdby);

      await orders.update(Number(id), {
        status: 'Completed',
        emp_remark: remark || order.emp_remark || null,
        complete_notification_email: sendCompletedEmail,
        modify_date: new Date(),
      });

      await this.saveCompletedAttachments(
        manager,
        id,
        attachments,
        replaceExisting,
      );

      if (client) {
        await users.update(client.id, {
          points: Number(client.points ?? 0) + 1,
        });
      }
    });

    const completedFiles = await this.completedDownloadRepo.find({
      where: { order_id: `${id}` },
      order: { id: 'DESC' },
    });

    if (
      sendCompletedEmail.toLowerCase() === 'yes' ||
      `${body.extra_emails ?? ''}`.trim()
    ) {
      const subjectAddress = order.subject_address || '';
      const summaryItems = `${body.summary_notes ?? ''}`
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
      const summaryHtml = summaryItems.length
        ? `<p>We have noted some special points. Please see below:</p><ul>${summaryItems.map((item) => `<li>${item}</li>`).join('')}</ul>`
        : '';
      const resendText = `${body.resend_remark ?? ''}`.trim();

      const client = await this.findNotificationUser(order.createdby);

      const clientName =
        `${client?.firstname ?? ''} ${client?.lastname ?? ''}`.trim() ||
        client?.firstname ||
        client?.username ||
        order.createdby ||
        'Client';
      await this.sendOrderEmail({
        order,
        subject: `${replaceExisting ? 'Updated Completed' : 'Completed'} File #${order.id} - ${subjectAddress}`,
        html: `<div><p>Hello ${clientName || 'Client'},<br/><br/>The following appraisal order has been completed.<br/>Please login and download files from dashboard.<br/><br/>File #-${order.id}<br/><br/>Address: ${subjectAddress}<br/><br/>${remark || resendText ? `Remark: ${remark || resendText}<br/><br/>` : ''}${summaryHtml}</p><p>Thank you,<br/><br/><b>Backbone Data Solutions Team</b><br/><b>+1 (760) 376-5994</b></p></div>`,
        extraEmails: body.extra_emails,
        attachments: completedFiles
          .filter((item) => `${item.filepath ?? ''}`.trim())
          .map((item) => ({
            filename: item.filename || undefined,
            path: join(process.cwd(), `${item.filepath}`.replace(/^\/+/, '')),
          })),
      });
    }

    return {
      message: replaceExisting
        ? 'Completed order documents updated successfully'
        : 'Order marked as completed successfully',
      order: await this.findOne(id),
    };
  }

  async update(
    id: string,
    dto: UpdateOrderDto,
    user?: Users,
    attachments: Array<{
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    }> = [],
  ) {
    const currentOrder = user
      ? await this.ensureOrderAccess(id, user)
      : await this.findOne(id);
    const normalizedFeedbackRating =
      dto.feedback_rating !== undefined &&
        dto.feedback_rating !== null &&
        `${dto.feedback_rating}` !== ''
        ? Number(dto.feedback_rating)
        : undefined;

    const { package_id: _, attachmentTypes: __, ...dtoWithoutMeta } = dto;
    const payload: Partial<Order> = {
      ...dtoWithoutMeta,
      tat_package_id:
        dto.tat_package_id !== undefined &&
          dto.tat_package_id !== null &&
          `${dto.tat_package_id}` !== ''
          ? Number(dto.tat_package_id)
          : undefined,
      tat_hours:
        dto.tat_hours !== undefined &&
          dto.tat_hours !== null &&
          `${dto.tat_hours}` !== ''
          ? Number(dto.tat_hours)
          : undefined,
      charged_amount:
        dto.charged_amount !== undefined &&
          dto.charged_amount !== null &&
          `${dto.charged_amount}` !== ''
          ? Number(dto.charged_amount)
          : undefined,
      amount:
        dto.amount !== undefined &&
          dto.amount !== null &&
          `${dto.amount}` !== ''
          ? Number(dto.amount)
          : undefined,
      feedback_rating: normalizedFeedbackRating,
      modify_date: new Date(),
      modifyby:
        user?.username ||
        user?.email ||
        currentOrder.modifyby ||
        currentOrder.createdby,
    };

    await this.orderRepo.update(Number(id), payload);

    if (attachments.length) {
      const attachmentTypes = Array.isArray(dto.attachmentTypes)
        ? dto.attachmentTypes
        : dto.attachmentTypes
          ? [dto.attachmentTypes]
          : [];

      await this.dataSource.transaction(async (manager) => {
        await this.saveWorkingAttachments(
          manager,
          id,
          attachments,
          attachmentTypes,
        );
      });
    }

    const updatedOrder = await this.findOne(id);

    await this.sendOrderEmail({
      order: updatedOrder,
      subject: `Order Updated File #${updatedOrder.id} - ${updatedOrder.subject_address ?? ''}`,
      html: `
    <div>
      <p>
        Hello ${updatedOrder.createdby},

        <br/><br/>

        Your appraisal order has been successfully updated.

        <br/><br/>

        File #${updatedOrder.id}

        <br/><br/>

        Address:
        ${updatedOrder.subject_address ?? ''}

        <br/><br/>

        Your requested changes have been saved successfully.

      </p>

      <p>
        Thank you,

        <br/><br/>

        <b>Backbone Data Solutions Team</b>

        <br/>

        +1 (760) 376-5994
      </p>
    </div>
  `,
    });

    return updatedOrder;
  }

  async submitFeedback(
    id: string,
    user: Users,
    body: { feedback?: string; feedback_rating?: number | string },
  ) {
    const order = await this.ensureOrderAccess(id, user);
    const feedback = `${body.feedback ?? ''}`.trim();
    const feedbackRating = this.toNullableNumber(body.feedback_rating);

    if (!feedback) {
      throw new BadRequestException('Feedback is required');
    }

    if ((order.status ?? '').trim().toLowerCase() !== 'completed') {
      throw new BadRequestException(
        "The feedback can't submitted as this is not completed order",
      );
    }

    await this.orderRepo.update(order.id, {
      feedback,
      feedback_rating: feedbackRating ?? order.feedback_rating,
      modify_date: new Date(),
      modifyby: user.username || user.email || `${user.id}`,
    });

    const updatedOrder = await this.findOne(id);
    const propAdd = updatedOrder.subject_address || '';
    const supportEmail =
      process.env.SMTP_ORDER_NOTIFY_TO ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      'orders@backbonedatasolutions.com';

    const smtpConfigured = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD,
    );

    if (smtpConfigured) {
      await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: supportEmail,
        subject: `Feedback for file #${updatedOrder.id} - ${propAdd}`,
        html: `<div><p>Hello Team,<br /><br />File #-${updatedOrder.id}<br /><br />Feedback-${feedback}<br /><br />Message from-${user.username || user.email || updatedOrder.createdby}<br /><br /></p><p>Thank you,<br /><br /><b>Backbone Data Solutions Team</b><br /><b>+1 (760) 376-5994</b></p></div>`,
      });
    }

    await this.sendOrderEmail({
      order: updatedOrder,
      subject: `Feedback for file #${updatedOrder.id} - ${propAdd}`,
      html: `<div><p>Hello,<br /><br />Thank you for sharing valuable feedback. Our management will review and get back to you as soon as possible.<br /><br /></p><p>Thank you,<br /><br /><b>Backbone Data Solutions Team</b><br /><b>+1 (760) 376-5994</b></p></div>`,
    });

    return {
      message: 'Thanx for providing your valuable feedback',
      order: updatedOrder,
    };
  }

  async deleteWorkingAttachment(downloadId: string, user: Users) {
    const row = await this.downloadRepo.findOne({
      where: { id: Number(downloadId) },
    });

    if (!row) {
      throw new NotFoundException(`Download with id ${downloadId} not found`);
    }

    if ((user.role ?? '').toLowerCase() === 'client') {
      const order = await this.findOne(`${row.order_id}`);
      const identifiers = [user.username, user.email, `${user.id}`]
        .map((value) => `${value ?? ''}`.trim().toLowerCase())
        .filter(Boolean);

      if (
        !identifiers.includes(`${order.createdby ?? ''}`.trim().toLowerCase())
      ) {
        throw new ForbiddenException('You do not have access to this document');
      }
    }

    await this.downloadRepo.delete(Number(downloadId));

    return { message: 'Document deleted successfully' };
  }

  async assignSupervisor(
    id: string,
    supervisor: string,
    assignerName?: string,
    status?: string,
  ) {
    await this.findOne(id);

    const payload: Partial<Order> = {
      assigned_supervisor: supervisor,
    };

    if (assignerName !== undefined) {
      payload.assigner_name = assignerName;
    }

    if (status) {
      payload.status = status;
    }

    await this.orderRepo.update(Number(id), payload);
    return this.findOne(id);
  }

  async assignTeamMember(
    id: string,
    teamMember: string,
    assignerName?: string,
    status?: string,
  ) {
    await this.findOne(id);

    const payload: Partial<Order> = {
      assigned_team_member: teamMember,
    };

    if (assignerName !== undefined) {
      payload.assigner_name = assignerName;
    }

    if (status) {
      payload.status = status;
    }

    await this.orderRepo.update(Number(id), payload);
    return this.findOne(id);
  }

  async updateOrderStatus(id: string, status: string, remark?: string) {
    const order = await this.findOne(id);

    if (status === 'Cancel' && order.status !== 'Cancel') {
      const refundAmount = Number(order.amount ?? 0);

      if (refundAmount > 0 && order.createdby) {
        const user = await this.userRepo.findOne({
          where: [{ email: order.createdby }, { username: order.createdby }],
        });

        if (user) {
          await this.userRepo.update(user.id, {
            wallete_balance: Number(user.wallete_balance ?? 0) + refundAmount,
          });

          const nextTxId = await getNextNumericId(this.transactionRepo);
          await this.transactionRepo.save(
            this.transactionRepo.create({
              id: nextTxId,
              amount: refundAmount,
              transaction_id: `REFUND-${order.id}`,
              createdby: user.username || user.email || order.createdby,
              created_date: new Date(),
              status: 'Approved',
              mode: 'Credit',
              credits: refundAmount,
              paymentid: null,
              orderid: `${order.id}`,
            }),
          );
        }
      }
    }

    if (status === 'Reopen' && order.status === 'Cancel') {
      const debitAmount = Number(order.amount ?? 0);

      if (debitAmount > 0 && order.createdby) {
        const user = await this.userRepo.findOne({
          where: [{ email: order.createdby }, { username: order.createdby }],
        });

        if (user) {
          await this.userRepo.update(user.id, {
            wallete_balance: Number(user.wallete_balance ?? 0) - debitAmount,
          });

          const nextTxId = await getNextNumericId(this.transactionRepo);
          await this.transactionRepo.save(
            this.transactionRepo.create({
              id: nextTxId,
              amount: debitAmount,
              transaction_id: `ORDER-${order.id}`,
              createdby: user.username || user.email || order.createdby,
              created_date: new Date(),
              status: 'Approved',
              mode: 'Debit',
              credits: 0,
              paymentid: null,
              orderid: `${order.id}`,
            }),
          );
        }
      }
    }

    const payload: Partial<Order> = {
      status,
      modify_date: new Date(),
    };

    if (remark !== undefined) {
      payload.remark = remark;
    }

    await this.orderRepo.update(Number(id), payload);
    const updatedOrder = await this.findOne(id);

    if (status === 'Cancel') {
      await this.sendOrderEmail({
        order: updatedOrder,
        subject: `Cancelled File #${updatedOrder.id} - ${updatedOrder.subject_address ?? ''}`,
        html: `<div><p>Hello ${updatedOrder.createdby || 'Client'},<br/><br/>Order has been cancelled successfully by Backbone Data Solutions Team and credits have been refunded to your account.<br/><br/>File #-${updatedOrder.id}<br/><br/>Address: ${updatedOrder.subject_address ?? ''}${remark?.trim() ? `<br/><br/>Remark: ${remark.trim()}` : ''}</p><p>Thank you,<br/><br/><b>Backbone Data Solutions Team</b><br/><b>+1 (760) 376-5994</b></p></div>`,
      });
    }

    if (status === 'Reopen') {
      await this.sendOrderEmail({
        order: updatedOrder,
        subject: `Reopen File #${updatedOrder.id} - ${updatedOrder.subject_address ?? ''}`,
        html: `<div><p>Hello ${updatedOrder.createdby || 'Client'},<br/><br/>Order has been reactivated successfully by Backbone Data Solutions Team. You can now edit the order again.<br/><br/>File #-${updatedOrder.id}<br/><br/>Address: ${updatedOrder.subject_address ?? ''}</p><p>Thank you,<br/><br/><b>Backbone Data Solutions Team</b><br/><b>+1 (760) 376-5994</b></p></div>`,
      });
    }

    return updatedOrder;
  }

  async updateReplyRemark(id: string, dto: UpdateOrderDto) {
    const currentOrder = await this.findOne(id);

    await this.orderRepo.update(Number(id), {
      reply: dto.reply,
      remark: dto.remark,
      description: dto.description,
      message: dto.message,
      modify_date: new Date(),
    });

    if (
      dto.reply?.trim() &&
      dto.reply.trim() !== `${currentOrder.reply ?? ''}`.trim()
    ) {
      await this.chatRepo.save(
        this.chatRepo.create({
          order_id: currentOrder.id,
          msg_time: new Date(),
          message: dto.reply.trim(),
          createdby: currentOrder.createdby,
          name: 'Backbone Data Solutions Team',
          login_id: null,
          email: null,
          msg_frm: 'team',
        }),
      );
    }

    return this.findOne(id);
  }

  private async ensureOrderAccess(id: string, user: Users) {
    const order = await this.findOne(id);

    if ((user.role ?? '').toLowerCase() !== 'client') {
      return order;
    }

    const identifiers = [user.username, user.email, `${user.id}`]
      .map((value) => `${value ?? ''}`.trim().toLowerCase())
      .filter(Boolean);

    if (
      !identifiers.includes(`${order.createdby ?? ''}`.trim().toLowerCase())
    ) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  private sanitizeFilename(filename: string) {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}
