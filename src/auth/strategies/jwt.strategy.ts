import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable } from '@nestjs/common';
import { AuthHelperService } from '../services/auth-helper.service';
import { TokenPayload } from '../types/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authHelperService: AuthHelperService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const authorization = request.headers['authorization'];

          if (typeof authorization !== 'string') {
            return null;
          }

          const parts = authorization.trim().split(/\s+/).filter(Boolean);
          return parts.length ? parts[parts.length - 1] : null;
        },
      ]),
      secretOrKey: configService.getOrThrow('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: TokenPayload) {
    const id = payload.sub;
    return this.authHelperService.currentUserById(id);
  }
}
