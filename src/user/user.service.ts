import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository, In } from 'typeorm';
import { Users } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { emailTransporter } from 'src/packages/nodemailer/transporter';
import { getNextNumericId } from 'src/utils/manual-id.util';

@Injectable()
export class UserService {
  private readonly allowedClientPageSizes = [50, 100, 250, 500];
  private readonly legacySecret = 'MAKV2SPBNI99212';
  private readonly legacySalt = Buffer.from([
    73, 118, 97, 110, 32, 77, 101, 100, 118, 101, 100, 101, 118,
  ]);

  constructor(
    @InjectRepository(Users) private userRepository: Repository<Users>,
    private readonly configService: ConfigService,
  ) { }

  private decryptLegacyPassword(cipherText?: string | null): string | null {
    if (!cipherText) {
      return null;
    }

    if (cipherText.startsWith('$2')) {
      return null;
    }

    try {
      const cipherBytes = Buffer.from(cipherText, 'base64');
      const derived = crypto.pbkdf2Sync(
        this.legacySecret,
        this.legacySalt,
        1000,
        48,
        'sha1',
      );

      const key = derived.subarray(0, 32);
      const iv = derived.subarray(32, 48);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      const decrypted = Buffer.concat([
        decipher.update(cipherBytes),
        decipher.final(),
      ]);

      return decrypted.toString('utf16le');
    } catch {
      return null;
    }
  }

  private encryptLegacyPassword(clearText: string): string {
    const derived = crypto.pbkdf2Sync(
      this.legacySecret,
      this.legacySalt,
      1000,
      48,
      'sha1',
    );

    const key = derived.subarray(0, 32);
    const iv = derived.subarray(32, 48);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(clearText, 'utf16le')),
      cipher.final(),
    ]);

    return encrypted.toString('base64');
  }

  private getPasswordPreview(password?: string | null): string {
    if (!password) {
      return '-';
    }

    const legacyPassword = this.decryptLegacyPassword(password);

    if (legacyPassword) {
      return legacyPassword;
    }

    return password.startsWith('$2') ? 'Protected' : password;
  }

  private mapClientForList(user: Users) {
    const { password, profile_pic, ...rest } = user;

    return {
      ...rest,
      select_type: user.type || '0',
      password_preview: this.getPasswordPreview(password),
    };
  }

  private mapEmployeeForList(user: Users) {
    const { password, profile_pic, ...rest } = user;

    return {
      ...rest,
      system_id: user.id,
      file_no: user.id,
      registration_date: user.date,
      password_preview: this.getPasswordPreview(password),
    };
  }

  private generateDefaultPassword(length = 15) {
    const digits = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    return `Backbone-${digits}`;
  }

  async create(createUserDto: CreateUserDto) {
    return this.createEmployee(createUserDto);
  }

  async createEmployee(createUserDto: CreateUserDto) {
    try {
      const email = createUserDto.email?.trim();
      const username = createUserDto.username?.trim();

      const existing = await this.userRepository.findOne({
        where: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
        ],
      });

      if (existing) {
        throw new BadRequestException('User already exists');
      }

      const providedPassword = createUserDto.password?.trim();
      const rawPassword = providedPassword || this.generateDefaultPassword();
      const password = providedPassword
        ? await bcrypt.hash(rawPassword, 10)
        : this.encryptLegacyPassword(rawPassword);
      const nextId = await getNextNumericId(this.userRepository);

      const record = this.userRepository.create({
        id: nextId,
        firstname: createUserDto.firstname?.trim(),
        lastname: createUserDto.lastname?.trim(),
        companyname: createUserDto.companyname?.trim(),
        referedby: createUserDto.referedby?.trim(),
        officeno: createUserDto.officeno?.trim(),
        email,
        username: username || email,
        mobileno: createUserDto.mobileno?.trim(),
        address: createUserDto.address?.trim(),
        city: createUserDto.city?.trim(),
        state: createUserDto.state?.trim(),
        zipcode: createUserDto.zipcode?.trim(),
        role: createUserDto.role || 'Team Member',
        status: createUserDto.status || 'Active',
        emp_supervisor: createUserDto.emp_supervisor?.trim(),
        accept_terms: createUserDto.accept_terms || 'Yes',
        free_trial: createUserDto.free_trial || 'No',
        std_instr: createUserDto.std_instr,
        type: createUserDto.type,
        altmail: createUserDto.altmail,
        wallete_balance: Number(createUserDto.wallete_balance ?? 0),
        points: Number(createUserDto.points ?? 0),
        date: new Date(),
        expiry_date: createUserDto.expiry_date
          ? new Date(createUserDto.expiry_date)
          : null,
        password,
      });

      const savedUser = await this.userRepository.save(record);
      return {
        ...savedUser,
        system_id: savedUser.id,
        file_no: savedUser.id,
        password_preview: rawPassword,
      } as Users & {
        system_id: number;
        file_no: number;
        password_preview: string;
      };
    } catch (error) {
      console.log('[Create Employee]:', error);
      throw error;
    }
  }

  async findAll(role?: string) {
    if (role) {
      return this.userRepository.find({ where: { role }, order: { id: 'DESC' } });
    }

    return this.userRepository.find({ order: { id: 'DESC' } });
  }

  async getClients(filters?: {
    name?: string;
    email?: string;
    username?: string;
    pageSize?: string;
  }) {
    const requestedPageSize = Number(filters?.pageSize ?? 50);
    const pageSize = this.allowedClientPageSizes.includes(requestedPageSize)
      ? requestedPageSize
      : 50;

    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'Client' })
      .andWhere("LOWER(COALESCE(user.status, '')) != :deletedStatus", {
        deletedStatus: 'deleted',
      })
      .orderBy('user.id', 'DESC')
      .take(pageSize);

    if (filters?.name?.trim()) {
      query.andWhere(
        '(user.firstname ILIKE :name OR user.lastname ILIKE :name OR user.companyname ILIKE :name)',
        {
          name: `%${filters.name.trim()}%`,
        },
      );
    }

    if (filters?.email?.trim()) {
      query.andWhere('user.email ILIKE :email', {
        email: `%${filters.email.trim()}%`,
      });
    }

    if (filters?.username?.trim()) {
      query.andWhere('user.username ILIKE :username', {
        username: `%${filters.username.trim()}%`,
      });
    }

    const clients = await query.getMany();
    return clients.map((client) => this.mapClientForList(client));
  }

  async getEmployees(role?: string) {
    const selectedRoles = role && role !== 'All'
      ? [role]
      : ['Admin', 'Supervisor', 'Team Member'];

    const employees = await this.userRepository.find({
      where: {
        role: In(selectedRoles),
        status: In([
          'Active',
          'New',
          'Pending',
          'Terminated',
          'Ex Employee',
          'Inactive',
        ]),
      },
      order: { id: 'DESC' },
    });

    return employees.map((employee) => this.mapEmployeeForList(employee));
  }

  async findOne(identifier: string | number) {
    const normalized = `${identifier}`.trim();

    if (/^\d+$/.test(normalized)) {
      const byId = await this.userRepository.findOne({
        where: { id: Number(normalized) },
      });

      if (byId) {
        return byId;
      }
    }

    return this.userRepository.findOne({
      where: [{ email: normalized }, { username: normalized }],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.updateUser(id, updateUserDto);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const payload: Partial<Users> = {
      ...updateUserDto,
      expiry_date: updateUserDto.expiry_date
        ? new Date(updateUserDto.expiry_date)
        : undefined,
    };

    if (updateUserDto.password) {
      payload.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.wallete_balance !== undefined) {
      payload.wallete_balance = Number(updateUserDto.wallete_balance);
    }

    if (updateUserDto.points !== undefined) {
      payload.points = Number(updateUserDto.points);
    }

    await this.userRepository.update(user.id, payload);

    return {
      message: 'User updated successfully',
      user: await this.userRepository.findOne({ where: { id: user.id } }),
    };
  }

  async changeStatus(id: string, status: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    await this.userRepository.update(user.id, { status });
    return this.userRepository.findOne({ where: { id: user.id } });
  }

  async assignSupervisor(id: string, supervisorId: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const supervisor = await this.findOne(supervisorId);
    if (!supervisor) {
      throw new NotFoundException('Supervisor does not exist');
    }

    await this.userRepository.update(user.id, {
      emp_supervisor: supervisor.username || `${supervisor.id}`,
    });

    return this.userRepository.findOne({ where: { id: user.id } });
  }

  async sendLoginDetails(id: string) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const passwordPreview = this.getPasswordPreview(user.password);
    const loginUrl =
      this.configService.get<string>('AUTH_UI_REDIRECT') ||
      'https://app.backbonedatasolutions.com/auth/sign-in';

    const emailBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hello ${user.firstname || ''} ${user.lastname || ''},</p>
        <p>Welcome to Backbone Data Solutions. Please use the link below to log in:</p>
        <p><a href="${loginUrl}">Open Login Page</a></p>
        <p>
          Login Username - <b>${user.username || user.email || '-'}</b><br />
          Login Password - <b>${passwordPreview}</b>
        </p>
        <p>
          Thank you,<br />
          <b>Backbone Data Solutions Team</b>
        </p>
      </div>
    `;

    const smtpConfigured = Boolean(
      this.configService.get('SMTP_HOST') &&
      this.configService.get('SMTP_USER') &&
      this.configService.get('SMTP_PASSWORD')
    );

    const bccList = (this.configService.get<string>('SMTP_BCC') || '')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    if (!smtpConfigured || (!user.email && !bccList.length)) {
      return {
        message:
          'SMTP is not configured for outgoing mail yet. Login details preview generated instead.',
        preview: {
          email: user.email,
          username: user.username,
          password: passwordPreview,
          loginUrl,
        },
      };
    }

    await emailTransporter.sendMail({
      from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
      to: user.email || bccList[0],
      bcc: bccList.length ? bccList : undefined,
      subject: 'Backbone Data Solutions - Log In Details',
      html: emailBody,
    });

    await this.userRepository.update(user.id, {
      sendmail: new Date().toISOString(),
    });

    return {
      message: 'Login details have been sent successfully.',
    };
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    await this.userRepository.update(user.id, { status: 'Deleted' });

    return {
      message: 'User deleted successfully',
    };
  }
}
