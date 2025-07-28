import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { transporter } from 'src/utils/transporter.email';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import { VerifyOtpDto } from './dto/verify-otp.dto';

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

    // const hashed = await bcrypt.hash(
    //   dto.password,
    //   Number(this.config.get<string>('BCRYPT_SALT_ROUNDS')),
    // );

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser({
      ...dto,
      password: hashed,
    });

    // return this.generateTokens(
    //     user._id as string
    // )
  }

  async generateOtp(
    dto: GenerateOtpDto,
    action: 'emailVerification' | 'passwordReset',
  ) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    let html = '';
    let subject = '';

    if (action === 'emailVerification') {
      subject = 'Your Email verification code.';
      html = `
    <p>Hello,</p>
    <p>Your ColabSpace email verification code is: <span style="display:inline-block; background:#f0f4ff; color:#1a237e; font-size:1.35em; font-weight:bold; letter-spacing:2px; padding:8px 18px; border-radius:6px; border:1px solid #c5cae9;">
    ${otp}
    </span></p>
    <p>Please enter this code in the app to verify your email address.</p>
    <br/>
    <p>Thank you,<br/>The ColabSpace Team</p>
  `;
    } else if (action === 'passwordReset') {
      subject = 'Your ColabSpace password reset verification code.';
      html = `
    <p>Hello,</p>
    <p>We received a request to reset your ColabSpace password.</p>
    <p>Your password reset code is: <span style="display:inline-block; background:#f0f4ff; color:#1a237e; font-size:1.35em; font-weight:bold; letter-spacing:2px; padding:8px 18px; border-radius:6px; border:1px solid #c5cae9;">
    ${otp}
    </span></p>
    <p>If you did not request this, please ignore this email.</p>
    <br/>
    <p>Thank you,<br/>The ColabSpace Team</p>
  `;
    } else {
      html = `<p>Invalid action.</p>`;
    }

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

    if (!user.otpExpiresAt || !isOtpValid || !isOtpExpired) {
      throw new UnauthorizedException('Invalid of expired OTP');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      {
        email: dto.email,
      },
      {
        isAuthenticated: true,
        otp: null,
        otpExpiresAt: null,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  generateTokens(
    userId: string,
    name: string,
    userName: string,
    email: string,
    role: string,
    isAuthenticated: boolean,
  ) {
    const payload = {
      userId,
      name,
      userName,
      email,
      role,
      isAuthenticated,
    };
  }
}
