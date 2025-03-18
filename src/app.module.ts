import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/service/prisma.module';
import { AuthModule } from './modules/auth';
import { PdfModule } from './modules/PDF';
import { TaskModule } from './modules/task';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PdfModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}