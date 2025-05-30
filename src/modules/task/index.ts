import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { PrismaService } from 'src/core/service/prisma.service'; // Assuming you have a Prisma service
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { EmailService } from 'src/core/emailService';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // Files in memory
    }),
  ],
  controllers: [TaskController],
  providers: [TaskService, PrismaService, EmailService],
})
export class TaskModule {}