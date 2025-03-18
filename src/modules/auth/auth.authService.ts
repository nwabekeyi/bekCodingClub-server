import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/service/prisma.service';
import * as bcrypt from 'bcryptjs';
import { 
  LoginDto, 
  CreateUserDto, 
  FetchUserByEmailDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  SendRegistrationLinkDto 
} from './auth.dto';
import { $Enums } from '@prisma/client';
import { EmailService } from 'src/core/emailService'; // Adjust path if needed

@Injectable()
export class AuthService {
  private domainUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService, // Inject EmailService
  ) {
    this.domainUrl = process.env.DOMAIN || 'http://localhost:3000';
  }


  //Login logic
  async login(loginDto: LoginDto) {
    const { email, password, role } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== role) {
      throw new UnauthorizedException('Invalid role for this user');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      access_token: token,
    };
  }

  //generate url token logic
  private generateToken(userId: number, email: string, role: $Enums.Role): string {
    const payload = { sub: userId, email, role };
    let token: string;
    if (role === $Enums.Role.admin) {
      token = this.jwtService.sign(payload, { expiresIn: '1h' });
    } else if (role === $Enums.Role.student) {
      token = this.jwtService.sign(payload, { expiresIn: '30m' });
    } else {
      token = this.jwtService.sign(payload);
    }
    return token;
  }

  //send reset password logic
  async sendResetPasswordLink(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User with this email does not exist');
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' }
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken },
    });

    const resetLink = `${this.domainUrl}/passwordreset/toekn?token=${resetToken}&email=${encodeURIComponent(email)}`;

    await this.emailService.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'resetPassword', // No .ejs extension, handled by EmailService
      context: {
        name: user.firstName || 'User',
        resetLink,
      },
    });

    return { message: 'Reset link sent to your email' };
  }


  //send registration link
  async sendRegistrationLink(sendRegistrationLinkDto: SendRegistrationLinkDto) {
    const { email, firstName } = sendRegistrationLinkDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const confirmationToken = require('crypto').randomBytes(32).toString('hex');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: confirmationToken },
    });

    const registrationLink = `${this.domainUrl}/signup/confirm?token=${confirmationToken}&email=${encodeURIComponent(email)}`;

    await this.emailService.sendEmail({
      to: email,
      subject: 'Welcome to Beks Coding Club - Confirm Your Registration',
      template: 'registrationForm', // No .ejs extension, handled by EmailService
      context: {
        name: firstName,
        registrationLink,
      },
    });

    return { message: 'Registration link sent to your email' };
  }

  //reset password link
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    const user = await this.prisma.user.findFirst({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid reset token');
    }

    try {
      this.jwtService.verify(token);
    } catch (error) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: null },
      });
      throw new UnauthorizedException('Token expired');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async confirmRegistration(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired confirmation token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: null },
    });

    return { message: 'Registration confirmed successfully' };
  }
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, role, firstName, lastName, phoneNumber, progress } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        firstName,
        lastName,
        phoneNumber,
        progress: progress ?? 0,
      },
    });
  }

  async getUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async updateUser(userId: number, updateUserDto: Partial<CreateUserDto>) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
  }

  async getUserByEmail(fetchUserByEmailDto: FetchUserByEmailDto) {
    const { email } = fetchUserByEmailDto;
    return this.prisma.user.findUnique({
      where: { email: email },
    });
  }

  async deleteUser(userId: number) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany();
  }
}