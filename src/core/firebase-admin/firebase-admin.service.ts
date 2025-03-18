import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../../../beks-coding-club-firebase-adminsdk-fbsvc-fd8ea8e508.json'; // Adjust path

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private firestore: admin.firestore.Firestore;

  constructor() {
    // Check if Firebase app is already initialized to avoid duplicate initialization
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      this.logger.log('Firebase Admin initialized');
    } else {
      this.logger.log('Firebase Admin already initialized, reusing existing instance');
    }
    this.firestore = admin.firestore();
  }

  async isEmailExists(email: string): Promise<boolean> {
    try {
      const usersRef = this.firestore.collection('registrations');
      const querySnapshot = await usersRef.where('email', '==', email).get();

      if (!querySnapshot.empty) {
        this.logger.log(`Email ${email} exists in Firestore`);
        return true;
      } else {
        this.logger.log(`Email ${email} does not exist in Firestore`);
        return false;
      }
    } catch (error) {
      this.logger.error('Error checking email in Firestore:', error);
      throw new Error('Failed to check email existence');
    }
  }
}