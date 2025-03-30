import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.authService';
import { AuthController, UserController } from './auth.controller';
import { PrismaService } from 'src/core/service/prisma.service';
import { UserService } from './auth.authService';
import { AuthGuard, AdminGuard } from './auth.authGard';
import { EmailModule } from 'src/core/emailService/email.module'; // Import EmailModule
import { FirebaseAdminService } from 'src/core/firebase-admin/firebase-admin.service';
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
    FirebaseAdminService
  ],
  controllers: [AuthController, UserController],
  exports: [
    JwtModule,   // Export JwtModule for JwtService access
    AuthGuard,   // Export AuthGuard for use in other modules
    AdminGuard,  // Export AdminGuard for use in other modules
  ],
})
export class AuthModule {}