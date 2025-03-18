import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.authService';
import { AuthController, UserController } from './auth.controller';
import { PrismaService } from 'src/core/service/prisma.service';
import { UserService } from './auth.authService';
import { AuthGuard, AdminGuard } from './auth.authGard';
import { EmailModule } from 'src/core/emailService/email.modeile'; // Import EmailModule

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    EmailModule, // Add EmailModule here
  ],
  providers: [
    AuthService,
    PrismaService,
    UserService,
    AuthGuard,
    AdminGuard,
  ],
  controllers: [AuthController, UserController],
})
export class AuthModule {}