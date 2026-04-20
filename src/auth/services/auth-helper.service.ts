import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Users } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthHelperService {
  private readonly legacySecret = 'MAKV2SPBNI99212';
  private readonly legacySalt = Buffer.from([
    73, 118, 97, 110, 32, 77, 101, 100, 118, 101, 100, 101, 118,
  ]);

  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

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

  async currentUserById(id: string): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: { id: Number(id) },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async validateUser(userIdentifier: string, userPassword: string) {
    const user = await this.userRepository.findOne({
      where: [{ email: userIdentifier }, { username: userIdentifier }],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    let isPasswordMatch = false;
    const storedPassword = user.password || '';

    if (storedPassword === userPassword) {
      isPasswordMatch = true;
    } else {
      try {
        const legacyEncryptedPassword = this.encryptLegacyPassword(userPassword);
        if (storedPassword === legacyEncryptedPassword) {
          isPasswordMatch = true;
        }
      } catch {
        isPasswordMatch = false;
      }

      if (!isPasswordMatch && storedPassword.startsWith('$2')) {
        isPasswordMatch = await bcrypt.compare(userPassword, storedPassword);
      } else if (!isPasswordMatch) {
        try {
          isPasswordMatch = await bcrypt.compare(userPassword, storedPassword);
        } catch {
          isPasswordMatch = false;
        }
      }
    }

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    return user;
  }

  async veryifyUserRefreshToken(refreshToken: string, userId: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }

    const user = await this.userRepository.findOne({
      where: { id: Number(userId) },
    });

    if (!user) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }

    return user;
  }
}
