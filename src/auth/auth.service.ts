import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { GenerateOtpDto } from './dto/generate-otp.dto';

@Injectable()
export class AuthService {
  constructor(
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
  }
}
