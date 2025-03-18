import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/service/prisma.module';
import { AuthModule } from './modules/auth';
import { PdfModule } from './modules/PDF';
import { TaskModule } from './modules/task';
import { FirebaseModule } from './core/firebase-admin/firebase-admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PdfModule,
    TaskModule,
    FirebaseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}