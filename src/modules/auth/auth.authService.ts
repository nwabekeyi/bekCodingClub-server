import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
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
import { EmailService } from 'src/core/emailService';
import { FirebaseAdminService } from 'src/core/firebase-admin/firebase-admin.service';

@Injectable()
export class AuthService {
  private domainUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly firebaseService: FirebaseAdminService,
  ) {
    this.domainUrl = process.env.DOMAIN || 'http://localhost:3000';
  }

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

  private generateToken(userId: number, email: string, role: $Enums.Role): string {
    const payload = { sub: userId, email, role };
    let token: string;
    if (role === $Enums.Role.admin) {
      token = this.jwtService.sign(payload, { expiresIn: '1h' });
    } else if (role === $Enums.Role.student) {
      token = this.jwtService.sign(payload, { expiresIn: '5h' });
    } else {
      token = this.jwtService.sign(payload);
    }
    return token;
  }

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

    const resetLink = `${this.domainUrl}/Signup/resetPassword.html/token?token=${resetToken}&email=${encodeURIComponent(email)}`;

    await this.emailService.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'resetPassword',
      context: {
        name: user.firstName || 'User',
        resetLink,
      },
    });

    return { message: 'Reset link sent to your email' };
  }

  async sendRegistrationLink(sendRegistrationLinkDto: SendRegistrationLinkDto) {
    const { email, firstName } = sendRegistrationLinkDto;

    // Check if email exists in Firestore 'registrations' collection
    const emailExistsInFirestore = await this.firebaseService.isEmailExists(email);
    if (!emailExistsInFirestore) {
      throw new UnauthorizedException('User is not a club member');
    }

    // Generate random token with expiration (1 hour)
    const confirmationToken = this.jwtService.sign(
      { email, createdAt: Date.now() },
      { expiresIn: '1h' }
    );

    // Store token in RegistrationTokens with email
    await this.prisma.registrationTokens.create({
      data: {
        token: confirmationToken,
        email,
      },
    });

    // Send registration link
    const registrationLink = `${this.domainUrl}/Auth/Signup/registrationForm.html?token=${confirmationToken}&email=${encodeURIComponent(email)}`;

    await this.emailService.sendEmail({
      to: email,
      subject: 'Welcome to Beks Coding Club - Confirm Your Registration',
      template: 'registration',
      context: {
        name: firstName,
        registrationLink,
      },
    });

    return { message: 'Registration link sent to your email' };
  }

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

  // Cleanup expired tokens (run periodically)
  async cleanupExpiredTokens() {
    const tokens = await this.prisma.registrationTokens.findMany();
    const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds

    for (const tokenRecord of tokens) {
      try {
        const decoded = this.jwtService.verify(tokenRecord.token);
        const createdAt = decoded.createdAt;
        if (Date.now() - createdAt > oneHourInMs) {
          await this.prisma.registrationTokens.delete({
            where: { token: tokenRecord.token },
          });
        }
      } catch (error) {
        // If token is invalid or expired, delete it
        await this.prisma.registrationTokens.delete({
          where: { token: tokenRecord.token },
        });
      }
    }
  }
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, role, firstName, lastName, phoneNumber, progress, token } = createUserDto;

    // Verify token and email in RegistrationTokens
    const registrationToken = await this.prisma.registrationTokens.findUnique({
      where: { token },
    });

    if (!registrationToken || registrationToken.email !== email) {
      throw new NotFoundException('Token not found or expired');
    }

    // Verify token expiration (1 hour)
    try {
      const decoded = this.jwtService.verify(token);
      const createdAt = decoded.createdAt;
      const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
      if (Date.now() - createdAt > oneHourInMs) {
        await this.prisma.registrationTokens.delete({ where: { token } });
        throw new NotFoundException('Token not found or expired');
      }
    } catch (error) {
      await this.prisma.registrationTokens.delete({ where: { token } });
      throw new NotFoundException('Token not found or expired');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
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

    // Delete token after successful user creation
    await this.prisma.registrationTokens.delete({
      where: { token },
    });

    return user;
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

  //update start date of learning 
  async updateUserStartDate(userId: number, startDate: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        startDate: new Date(startDate), // Convert string to Date object
        status: 'active', // Set status to "active"
      },
    });
  }
}