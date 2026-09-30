import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Response } from 'express';
import { emailTransporter } from 'src/packages/nodemailer/transporter';
import { Users } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { TokenPayload } from '../types/types';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { State } from 'src/masters/state/entity/state.entity';

@Injectable()
export class AuthService {
  private readonly legacySecret = 'MAKV2SPBNI99212';
  private readonly legacySalt = Buffer.from([
    73, 118, 97, 110, 32, 77, 101, 100, 118, 101, 100, 101, 118,
  ]);

  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
  ) { }

  async getClientRegistrationMeta() {
    const states = await this.stateRepository.find({
      order: { city: 'ASC' },
    });

    return {
      states,
      softwareOptions: [
        'Aurora (a la mode)',
        'ClickFORMS (Bradford)',
        'Total (a la mode)',
        'ACI Report (ACI)',
      ],
    };
  }

  async checkUsernameAvailability(username?: string) {
    const normalized = `${username ?? ''}`.trim();

    if (!normalized) {
      return { available: false, message: 'Username is required.' };
    }

    if (!/^[a-zA-Z0-9]{6,10}$/.test(normalized)) {
      return {
        available: false,
        message:
          'Username must be 6 to 10 characters and contain only letters and numbers.',
      };
    }

    const existing = await this.userRepository.findOne({
      where: { username: normalized },
    });

    return {
      available: !existing,
      message: existing ? 'Username already exists.' : 'Username is available.',
    };
  }

  async registerClient(
    payload: CreateUserDto & {
      software?: string;
      agreeToTerms?: boolean;
    },
  ) {
    const firstname = payload.firstname?.trim();
    const lastname = payload.lastname?.trim();
    const email = payload.email?.trim();
    const username = payload.username?.trim();
    const companyname = payload.companyname?.trim();
    const mobileno = payload.mobileno?.trim();
    const address = payload.address?.trim();
    const city = payload.city?.trim();
    const state = payload.state?.trim();
    const zipcode = payload.zipcode?.trim();
    const software = payload.software?.trim();

    if (
      !firstname ||
      !lastname ||
      !email ||
      !username ||
      !companyname ||
      !mobileno ||
      !address ||
      !city ||
      !state ||
      !zipcode
    ) {
      throw new BadRequestException('Please complete all required fields.');
    }

    if (!payload.agreeToTerms) {
      throw new BadRequestException('Please accept the terms and privacy policy.');
    }

    if (!/^[a-zA-Z0-9]{6,10}$/.test(username)) {
      throw new BadRequestException(
        'Username must be 6 to 10 characters and contain only letters and numbers.',
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new BadRequestException(
        existingUser.username === username
          ? 'Username already exists.'
          : 'Email address already exists.',
      );
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const createdUser = await this.usersService.createEmployee({
      firstname,
      lastname,
      email,
      username,
      companyname,
      mobileno,
      address,
      city,
      state,
      zipcode,
      role: 'Client',
      status: 'Pending',
      accept_terms: 'true',
      wallete_balance: Number(payload.wallete_balance ?? 30),
      free_trial: 'On',
      expiry_date: expiryDate.toISOString(),
    });

    const smtpConfigured = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD,
    );

    if (smtpConfigured && email) {
      const bccList = (process.env.SMTP_BCC || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const loginUrl =
        this.configService.get<string>('AUTH_UI_REDIRECT') ||
        'https://app.backbonedatasolutions.com/auth/sign-in';

      await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        bcc: bccList.length ? bccList : undefined,
        subject: 'Registration Completed',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Hello ${firstname} ${lastname},</p>
            <p>Thanks for registering with Backbone Data Solutions.</p>
            <p>Your profile has been created and is currently <b>pending review</b>. The team will review it and get back to you shortly.</p>
            <p>Preferred software: <b>${software || 'Not specified'}</b></p>
            <p>Login page: <a href="${loginUrl}">${loginUrl}</a></p>
            <p>Thank you,<br /><b>Backbone Data Solutions Team</b></p>
          </div>
        `,
      });

      try {

        await emailTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: process.env.SMTP_REGISTRATION_NOTIFY_TO,
          subject: 'New Client Registration',
          html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Hello Team,</p>

      <p>A new client has registered.</p>

      <table>
        <tr><td><b>Name</b></td><td>${firstname} ${lastname}</td></tr>
        <tr><td><b>Company</b></td><td>${companyname}</td></tr>
        <tr><td><b>Email</b></td><td>${email}</td></tr>
        <tr><td><b>Username</b></td><td>${username}</td></tr>
        <tr><td><b>Phone</b></td><td>${mobileno}</td></tr>
        <tr><td><b>Software</b></td><td>${software || '-'}</td></tr>
      </table>

      <br/>

      <p>Please review and activate the account.</p>

      <br/>

      <b>Backbone Data Solutions</b>
    </div>
  `,
        });
      } catch (error) {
        console.error('Registration notification email failed:', error);
      }
    }

    return {
      message: 'Registration successfully done. We will review your profile and get back to you.',
      previewMode: !smtpConfigured,
      userId: createdUser.id,
    };
  }

  async signIn(response: Response, user: Users, redirect: boolean = false) {
    const payload: TokenPayload = {
      sub: `${user.id}`,
      email: user.email,
      username: user.username,
    };

    const { access_token } = await this.generateAccessToken(response, payload);
    const { refresh_token } = await this.generateRefreshToken(
      payload,
      response,
    );

    if (redirect) {
      response.redirect(this.configService.getOrThrow('AUTH_UI_REDIRECT'));
    }

    return {
      access_token,
      refresh_token,
      user,
    };
  }

  async signUp(signUpDto: CreateUserDto, response: Response) {
    const identifier = signUpDto.email?.trim() || signUpDto.username?.trim();
    const isUserExist = await this.usersService.findOne(identifier);

    if (isUserExist) {
      throw new BadRequestException('User already exists');
    }

    const user: Users = await this.usersService.create({
      ...signUpDto,
      username: signUpDto.username?.trim() || signUpDto.email?.trim(),
      email: signUpDto.email?.trim(),
      role: signUpDto.role || 'Client',
      status: signUpDto.status || 'Active',
    });

    const userPayload: TokenPayload = {
      sub: `${user.id}`,
      email: user.email,
      username: user.username,
    };

    const { access_token } = await this.generateAccessToken(
      response,
      userPayload,
    );
    const { refresh_token } = await this.generateRefreshToken(
      userPayload,
      response,
    );

    return {
      access_token,
      refresh_token,
    };
  }

  async generateAccessToken(response: Response, payload: TokenPayload) {
    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() +
      parseInt(
        this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION_MS',
        ),
      ),
    );

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_SECRET_KEY'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS',
      )}ms`,
    });

    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      expires: expiresAccessToken,
      path: '/',
    });

    return { access_token };
  }

  async generateRefreshToken(payload: TokenPayload, response: Response) {
    const expiresRefreshoken = new Date();
    expiresRefreshoken.setMilliseconds(
      expiresRefreshoken.getTime() +
      parseInt(
        this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION_MS',
        ),
      ),
    );

    const refresh_token = await this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET_KEY'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_REFRESH_TOKEN_EXPIRATION_MS',
      )}ms`,
    });

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      expires: expiresRefreshoken,
      path: '/',
    });

    return { refresh_token };
  }

  private decryptLegacyPassword(cipherText?: string | null): string | null {
    if (!cipherText || cipherText.startsWith('$2')) {
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

  private async isCurrentPasswordValid(user: Users, candidate: string) {
    if (!candidate?.trim()) {
      return false;
    }

    if (user.password?.startsWith('$2')) {
      return bcrypt.compare(candidate, user.password);
    }

    const legacyPassword = this.decryptLegacyPassword(user.password);

    if (legacyPassword) {
      return legacyPassword === candidate;
    }

    return user.password === candidate;
  }

  async changePassword(
    id: string,
    password?: string,
    currentPassword?: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: Number(id) },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const nextPassword = password?.trim();

    if (!nextPassword) {
      throw new BadRequestException('New password is required');
    }

    if (nextPassword.length < 6) {
      throw new BadRequestException(
        'New password must be at least 6 characters long',
      );
    }

    if (currentPassword !== undefined) {
      const isValid = await this.isCurrentPasswordValid(user, currentPassword);

      if (!isValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    const hashedPassword = await bcrypt.hash(nextPassword, 10);
    await this.userRepository.update(user.id, { password: hashedPassword });
  }
}
