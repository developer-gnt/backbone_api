import { Module } from '@nestjs/common';
// import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateLimiterModule } from 'nestjs-rate-limiter';
import { Roles } from 'src/roles/entities/roles.entity';
import { RolesModule } from 'src/roles/roles.module';
import { Users } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './controllers/auth.controller';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthHelperService } from './services/auth-helper.service';
import { AuthService } from './services/auth.service';
import { ValidationService } from './services/validation-helper.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RolesGuard } from 'src/packages/authorization/roles.guard';

@Module({
  imports: [
    UserModule,
    JwtModule,
    PassportModule,
    TypeOrmModule.forFeature([Users, Roles]),
    RolesModule,
    RateLimiterModule,
  ],
  controllers: [AuthController],
  providers: [
    RolesGuard,
    ValidationService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    AuthHelperService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    AuthService,
  ],
  exports: [AuthService, ValidationService, JwtModule],
})
export class AuthModule {}
