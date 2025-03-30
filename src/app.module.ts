import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/service/prisma.module';
import { AuthModule } from './modules/auth';
import { PdfModule } from './modules/PDF';
import { TaskModule } from './modules/task';
import { FirebaseModule } from './core/firebase-admin/firebase-admin.module';
import { CertificateModule } from './modules/generateCerficate';
import { AdminGuard } from './modules/auth/auth.authGard';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PdfModule,
    TaskModule,
    FirebaseModule,
    CertificateModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}