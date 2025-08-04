import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { transporter } from 'src/utils/transporter.email';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { generateToken, verifyToken } from 'src/jwt/jwt.utils';
import { LoginDto } from './dto/login.dto';
import { buildOtpEmailTemplate } from 'src/utils/email.template';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing) throw new ConflictException('Email already registered!');

    const hashed = await bcrypt.hash(
      dto.password,
      Number(this.config.get<string>('BCRYPT_SALT_ROUNDS')),
    );

    // const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser({
      ...dto,
      password: hashed,
    });

    return this.generateTokens(
      user._id as string,
      user.email,
      user.role,
      user.isAuthenticated,
    );
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const matched = await bcrypt.compare(dto.password, user?.password);
    if (!matched) {
      throw new UnauthorizedException('incorrect password');
    }

    return this.generateTokens(
      user._id as string,
      user.email,
      user.role,
      user.isAuthenticated,
    );
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isAuthenticated)
      throw new UnauthorizedException('Please verify the OTP first');

    const hashedPassword = await bcrypt.hash(
      dto.password,
      Number(this.config.get<string>('BCRYPT_SALT_ROUNDS')),
    );

    user.password = hashedPassword;
    user.otp = null;

    await user.save();

    return {
      message: 'Password reset successfully',
    };
  }

  async generateOtp(
    dto: GenerateOtpDto,
    action: 'emailVerification' | 'passwordReset',
  ) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    const { html, subject } = buildOtpEmailTemplate(otp, action);

    await transporter().sendMail({
      from: this.config.get<string>('ADMIN_EMAIL'),
      to: dto.email,
      subject,
      html,
    });

    await this.userModel.findOneAndUpdate(
      {
        email: dto.email,
      },
      {
        otp: hashedOtp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    );
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user) throw new NotFoundException('User Not Found!');
    if (!user.otp) throw new UnauthorizedException('Otp Not Found');

    const isOtpValid = await bcrypt.compare(dto.otp, user.otp);
    const isOtpExpired = new Date(user.otpExpiresAt).getTime() < Date.now();

    if (!user.otpExpiresAt || !isOtpValid || isOtpExpired) {
      throw new UnauthorizedException('Invalid of expired OTP');
    }

    const updatedUser = (await this.userModel.findByIdAndUpdate(
      user._id,
      {
        isAuthenticated: true,
        otp: null,
        otpExpiresAt: null,
      },
      {
        new: true,
        runValidators: true,
      },
    )) as User;

    return this.generateTokens(
      updatedUser._id as string,
      updatedUser.email,
      updatedUser.role,
      updatedUser.isAuthenticated,
    );
  }

  generateTokens(
    userId: string,
    email: string,
    role: string,
    isAuthenticated: boolean,
  ) {
    const payload = {
      userId,
      email,
      role,
      isAuthenticated,
    };

    const accessToken = generateToken(
      payload,
      this.config.get<string>('JWT_ACCESS_SECRET')!,
      this.config.get<string>('ACCESS_TOKEN_EXPIRATION')!,
    );

    const refreshToken = generateToken(
      payload,
      this.config.get<string>('JWT_REFRESH_SECRET')!,
      this.config.get<string>('REFRESH_TOKEN_EXPIRATION')!,
    );

    return { accessToken, refreshToken };
  }

  async generateRefreshTokens(token: string) {
    const decoded = verifyToken(
      token,
      this.config.get<string>('JWT_REFRESH_SECRET')!,
    );

    const { userId } = decoded as Record<string, string>;

    const user = await this.usersService.findById(userId);

    const jwtPayload = {
      userId: user._id as string,
      email: user.email,
      role: user.role,
      isAuthenticated: user.isAuthenticated,
    };

    const accessToken = generateToken(
      jwtPayload,
      this.config.get<string>('JWT_ACCESS_SECRET')!,
      this.config.get<string>('ACCESS_TOKEN_EXPIRATION')!,
    );

    return {
      accessToken,
    };
  }
}
