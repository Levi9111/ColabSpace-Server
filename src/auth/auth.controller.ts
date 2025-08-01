import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from 'src/jwt/guards/jwt-auth.guard';
import { RoleGuards } from 'src/jwt/guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);

    if ('message' in result) throw new UnauthorizedException(result.message);

    const { accessToken, refreshToken } = result;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: this.config.get<string>('NODE_ENV') === 'production',
      secure: this.config.get<string>('NODE_ENV') === 'production',
    });

    return {
      accessToken,
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: this.config.get<string>('NODE_ENV') === 'production',
      secure: this.config.get<string>('NODE_ENV') === 'production',
    });

    return {
      accessToken,
    };
  }

  @Get('login/refresh-token')
  async refresh(@Req() req: Request) {
    const refreshToken = (await req.cookies?.refreshToken) as string;

    if (!refreshToken)
      throw new UnauthorizedException('Unauthorized access. Token not valid');

    return this.authService.generateRefreshTokens(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RoleGuards)
  me(@Req() req: Request) {
    return req.user;
  }

  @Post('generate-otp')
  async genrateOtp(@Body() dto: GenerateOtpDto) {
    await this.authService.generateOtp(dto, 'emailVerification');
  }

  @Post('forgot-password/generate-otp')
  async genrateOtpForPassword(@Body() dto: GenerateOtpDto) {
    await this.authService.generateOtp(dto, 'passwordReset');
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.verifyOtp(dto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: this.config.get<string>('NODE_ENV') === 'production',
      secure: this.config.get<string>('NODE_ENV') === 'production',
    });

    return {
      accessToken,
    };
  }
}
