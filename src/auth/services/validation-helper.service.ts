import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { Users } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ValidationService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private readonly configService: ConfigService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async currentUser(): Promise<Users> {
    const token = this.request.headers['authorization'];
    const updatedToken = token?.replace('Bearer ', '');

    const { sub: userId } = await this.jwtService.verifyAsync(updatedToken, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET_KEY'),
    });

    return this.userService.findOne(userId);
  }

  async validateUser(userIdentifier: string, userPassword: string) {
    const user = await this.userService.findOne(userIdentifier);
    const isPasswordMatch = await bcrypt.compare(userPassword, user?.password);

    if (!user || !isPasswordMatch) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    return user;
  }
}
