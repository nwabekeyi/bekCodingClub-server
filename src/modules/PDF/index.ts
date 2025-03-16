import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { FileService } from './pdf.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // Import memoryStorage

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // Store files in memory instead of disk
    }),
  ],
  controllers: [PdfController],
  providers: [FileService],
})
export class PdfModule {}