import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.authService';
import { AuthController, UserController } from './auth.controller';
import { PrismaService } from 'src/core/service/prisma.service';// Assuming Prisma service is setup
import { UserService } from './auth.authService';
import { AuthGuard, AdminGuard } from './auth.authGard';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Ensure JWT_SECRET is defined in .env
      signOptions: { expiresIn: '1d' }, // Token expires in 1 day
    }),
  ],
  providers: [AuthService,
    PrismaService,
    UserService,
    AuthGuard,
    AdminGuard
  ],
  controllers: [AuthController, UserController],
})
export class AuthModule {}
