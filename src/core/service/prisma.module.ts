import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes the PrismaModule available globally
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export PrismaService to make it available for other modules
})
export class PrismaModule {}
