import { Module } from '@nestjs/common';
import { CertificateService } from './generateCertificate.service';
import { CertificateController } from './generateCertificate.controller';
import { EmailModule } from 'src/core/emailService/email.module'; // Adjust path as needed
import { JwtModule } from '@nestjs/jwt'; // Add this

@Module({
  imports: [
    EmailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret', // Use your JWT secret
      signOptions: { expiresIn: '24h' }, // Optional: configure as needed
    }),
  ],
  controllers: [CertificateController],
  providers: [CertificateService],
})
export class CertificateModule {}