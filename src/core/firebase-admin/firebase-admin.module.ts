import { Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service'; // Adjust the path if needed

@Module({
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService], // Export the service if you want to use it in other modules
})
export class FirebaseModule {}
