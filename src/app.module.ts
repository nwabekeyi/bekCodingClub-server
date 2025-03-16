import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/service/prisma.module';
import { AuthModule } from './modules/auth';
import { PdfModule } from './modules/PDF';

@Module({
  imports: [
    PrismaModule,
     AuthModule,
    PdfModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
