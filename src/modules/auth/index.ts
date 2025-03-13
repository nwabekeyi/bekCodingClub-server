import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './authService';
import { AuthController } from './controller';
import { PrismaService } from 'src/core/service/prisma.service';// Assuming Prisma service is setup

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Ensure JWT_SECRET is defined in .env
      signOptions: { expiresIn: '1d' }, // Token expires in 1 day
    }),
  ],
  providers: [AuthService, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}
