import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { RateLimit, RateLimiterGuard } from 'nestjs-rate-limiter';
import { Public } from 'src/public-strategy';
import { Users } from 'src/user/entities/user.entity';
import { CurrentUser } from '../decorators/current-user-decorator';
import { SignInDto } from '../dto/sign-in-dto';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('auth')
@ApiTags('Auth Controller')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('registration-meta')
  @ApiOperation({ summary: 'Public metadata for the client registration form' })
  async getRegistrationMeta() {
    return this.authService.getClientRegistrationMeta();
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('check-username')
  @ApiOperation({ summary: 'Check whether a client login name is available' })
  async checkUsername(@Query('username') username?: string) {
    return this.authService.checkUsernameAvailability(username);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('client-registration')
  @ApiOperation({ summary: 'Register a new client without authentication' })
  async clientRegistration(
    @Body()
    body: CreateUserDto & {
      software?: string;
      agreeToTerms?: boolean;
    },
  ) {
    return this.authService.registerClient(body);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  // @RateLimit({
  //   points: 5,
  //   duration: 60,
  // })
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({
    status: 200,
    description: 'Login Successfully',
  })
  async signIn(
    @CurrentUser() user: Users,
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.authService.signIn(response, user);
      return {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      };
    } catch (error) {
      console.log('Error: for fn signIn', error);
      throw error ?? 'Error Plz try again';
    }
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  @UseGuards(RateLimiterGuard)
  @RateLimit({
    points: 5,
    duration: 60,
  })
  @ApiOperation({ summary: 'User Signup' })
  @ApiResponse({
    status: 200,
    description: 'SignUp Successfully',
  })
  async signUp(
    @Body() signUpDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      return this.authService.signUp(signUpDto, response);
    } catch (error) {
      console.error('Error during sign-up:', error);
      throw error;
    }
  }

  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'User Details' })
  @ApiResponse({
    status: 200,
    description: 'User found',
  })
  async authMe(@CurrentUser() user: Users) {
    try {
      return user;
    } catch (error) {
      console.error('Error while fetching the user:', error);
      throw error;
    }
  }

  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Log Out Successfully' })
  @ApiResponse({
    status: 200,
    description: 'Log Out Successfully',
  })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', { httpOnly: true });
    response.clearCookie('refresh_token', { httpOnly: true });
    return {
      message: 'Log Out Successfully',
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({
    status: 200,
    description: 'token refreshed successfully',
  })
  async refresh(
    @CurrentUser() user: Users,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.authService.signIn(response, user);
      return {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      };
    } catch (error) {
      console.log('Error: for fn signIn', error);
      throw error ?? 'Error Plz try again';
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  loginGoogle() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() user: Users,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.signIn(response, user, true);
  }

  @ApiBearerAuth('access-token')
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: any,
    @Body()
    body: {
      currentPassword?: string;
      newPassword?: string;
      password?: string;
    },
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    const nextPassword = body.newPassword ?? body.password;

    await this.authService.changePassword(
      userId,
      nextPassword,
      body.currentPassword,
    );
    return { message: 'Password changed successfully' };
  }
}
