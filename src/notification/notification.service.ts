import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { emailTransporter } from 'src/packages/nodemailer/transporter';
import { getNextNumericId } from 'src/utils/manual-id.util';
import { Users } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
  ) { }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildEmailBody(message: string) {
    const formattedMessage = this.escapeHtml(message).replace(/\r?\n/g, '<br />');

    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <p>${formattedMessage}</p>
        <p style="margin-top: 24px;">
          Thank you,<br /><br />
          <b>Backbone Data Solutions Team</b><br />
          <b>+1 (760) 376-5994</b>
        </p>
      </div>
    `;
  }

  private buildReferralBody(payload: {
    loginEmail: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  }) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <p>Hello Team,</p>
        <p>A new referral has been submitted by <b>${this.escapeHtml(payload.loginEmail)}</b>.</p>
        <ul>
          <li><b>First Name:</b> ${this.escapeHtml(payload.firstName)}</li>
          <li><b>Last Name:</b> ${this.escapeHtml(payload.lastName)}</li>
          <li><b>Email:</b> ${this.escapeHtml(payload.email)}</li>
          <li><b>Mobile:</b> ${this.escapeHtml(payload.mobile)}</li>
        </ul>
        <p style="margin-top: 24px;">
          Thank you,<br /><br />
          <b>Backbone Data Solutions Team</b><br />
          <b>+1 (760) 376-5994</b>
        </p>
      </div>
    `;
  }

  async sendContactMessage(payload: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  }) {
    const name = payload.name?.trim();
    const email = payload.email?.trim();
    const subject = payload.subject?.trim();
    const message = payload.message?.trim();

    if (!name || !email || !subject || !message) {
      throw new BadRequestException(
        'Name, email, subject, and message are required',
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <p>Hi,</p>
        <p><b>My Name:</b> ${this.escapeHtml(name)}</p>
        <p><b>Email:</b> ${this.escapeHtml(email)}</p>
        <p><b>Subject:</b> ${this.escapeHtml(subject)}</p>
        <p><b>Message:</b><br />${this.escapeHtml(message).replace(/\r?\n/g, '<br />')}</p>
        <p style="margin-top: 24px;">
          Regards,<br /><br />
          <a href="https://www.backbonedatasolutions.com/">www.backbonedatasolutions.com</a>
        </p>
      </div>
    `;

    const recipients = [
      email,
      process.env.SMTP_ORDER_NOTIFY_TO || 'orders@backbonedatasolutions.com',
    ].filter(Boolean);

    const smtpConfigured = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD,
    );

    if (!smtpConfigured) {
      return {
        message:
          'Your message was captured successfully. SMTP is not configured yet, so this ran in preview mode.',
        previewMode: true,
        preview: { recipients, subject: 'Enquiry from Client Board', html },
      };
    }

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipients,
      subject: 'Enquiry from Client Board',
      html,
    });

    return {
      message: 'Your message is sent successfully.',
      previewMode: false,
    };
  }

  async saveReferral(
    user: Users,
    payload: {
      firstName?: string;
      lastName?: string;
      email?: string;
      mobile?: string;
    },
  ) {
    const firstName = payload.firstName?.trim();
    const lastName = payload.lastName?.trim();
    const email = payload.email?.trim();
    const mobile = payload.mobile?.trim();

    if (!firstName || !lastName || !email || !mobile) {
      throw new BadRequestException(
        'First name, last name, email, and mobile are required',
      );
    }

    const nextId = await getNextNumericId(this.referralRepository);
    const loginEmail = user.username || user.email || `${user.id}`;

    const savedReferral = await this.referralRepository.save(
      this.referralRepository.create({
        id: nextId,
        login_email: loginEmail,
        referral_email: email,
        first_name: firstName,
        last_name: lastName,
        mob: mobile,
      }),
    );

    const smtpConfigured = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD,
    );

    if (!smtpConfigured) {
      return {
        message:
          'Referral saved successfully. SMTP is not configured yet, so no outbound email was sent.',
        previewMode: true,
        referral: savedReferral,
      };
    }

    const notifyTo =
      process.env.SMTP_ORDER_NOTIFY_TO ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER;

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: notifyTo,
      subject: 'Backbone Data Solutions - New Referral Added',
      html: this.buildReferralBody({
        loginEmail,
        firstName,
        lastName,
        email,
        mobile,
      }),
    });

    return {
      message: 'Referral saved successfully.',
      previewMode: false,
      referral: savedReferral,
    };
  }

  async sendMassEmail(payload: {
    subject?: string;
    message?: string;
    recipientIds?: Array<number | string>;
    sendToAllClients?: boolean;
  }) {
    const subject = payload.subject?.trim();
    const message = payload.message?.trim();

    if (!subject) {
      throw new BadRequestException('Subject is required');
    }

    if (!message) {
      throw new BadRequestException('Message is required');
    }

    const requestedIds = (payload.recipientIds ?? [])
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));

    const sendToAllClients = payload.sendToAllClients || requestedIds.length === 0;

    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'Client' })
      .andWhere("LOWER(COALESCE(user.status, '')) != :deletedStatus", {
        deletedStatus: 'deleted',
      })
      .orderBy('user.id', 'DESC');

    if (!sendToAllClients) {
      query.andWhere('user.id IN (:...ids)', { ids: requestedIds });
    }

    const users = await query.getMany();

    if (!users.length) {
      throw new BadRequestException('No client recipients found');
    }

    const recipients = users.filter((user) => user.email?.trim());
    const skippedCount = users.length - recipients.length;

    if (!recipients.length) {
      throw new BadRequestException('Selected clients do not have valid email addresses');
    }

    const html = this.buildEmailBody(message);
    const smtpConfigured = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD,
    );

    if (!smtpConfigured) {
      return {
        message:
          'SMTP is not configured for outgoing mail yet. Email preview generated instead.',
        previewMode: true,
        totalRecipients: recipients.length,
        skippedCount,
        preview: {
          subject,
          html,
          recipients: recipients.slice(0, 20).map((user) => ({
            id: user.id,
            email: user.email,
            username: user.username,
          })),
        },
      };
    }

    const bccList = (process.env.SMTP_BCC || '')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    const sendResults = await Promise.allSettled(
      recipients.map((user) =>
        emailTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: user.email,
          subject,
          html,
        }),
      ),
    );

    if (bccList.length) {
      emailTransporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: bccList[0],
        bcc: bccList.length > 1 ? bccList.slice(1) : undefined,
        subject: `[Admin Copy] ${subject}`,
        html,
      }).catch(err => console.error("Failed to send admin copy for mass email", err));
    }

    const sentIds: number[] = [];
    let failedCount = 0;

    sendResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        sentIds.push(recipients[index].id);
      } else {
        failedCount += 1;
      }
    });

    if (sentIds.length) {
      await this.userRepository
        .createQueryBuilder()
        .update(Users)
        .set({ sendmail: new Date().toISOString() })
        .where('id IN (:...ids)', { ids: sentIds })
        .execute();
    }

    return {
      message:
        failedCount === 0
          ? 'Emails Send Successfully'
          : `Mass mailing completed with ${sentIds.length} sent and ${failedCount} failed.`,
      previewMode: false,
      totalRecipients: recipients.length,
      sentCount: sentIds.length,
      failedCount,
      skippedCount,
    };
  }
}
