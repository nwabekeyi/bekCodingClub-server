import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailService } from 'src/core/emailService';
import { generateCertificate } from '../../utils/generateCertificate';
import { CustomLogger } from 'src/core/logger';
import { configureCloudinary } from 'src/config/cloudinary.config';

@Injectable()
export class CertificateService {
  private readonly logger = new CustomLogger(CertificateService.name);

  constructor(private readonly emailService: EmailService) {
    configureCloudinary(); // Initialize Cloudinary
  }

  async generateAndSendCertificate(dto: { firstName: string; lastName: string; email: string }) {
    const { firstName, lastName, email } = dto;

    try {
      // Generate certificate download link
      const downloadLink = await generateCertificate(firstName, lastName);
      if (!downloadLink || !downloadLink.startsWith('https://')) {
        this.logger.error('Invalid or missing download link from Cloudinary');
        throw new BadRequestException('Failed to generate a valid certificate link');
      }
      this.logger.debug(`Generated download link: ${downloadLink}`);

      // Define email options
      const emailOptions = {
        to: email,
        subject: 'Your Certificate of Completion - Beks Coding Club',
        template: 'certificateEmail', // Template file name without extension
        context: {
          firstName,
          lastName,
          courseName: 'Fundamentals of HTML and CSS', // Example course name
          completionDate: new Date().toLocaleDateString(),
          downloadLink, // Pass the download link to the email template
        },
      };
      // Send email
      await this.emailService.sendEmail(emailOptions);
      this.logger.debug(`Email with download link sent to ${email} for ${firstName} ${lastName}`);

      return { message: 'Certificate generated and email with download link sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to generate or send certificate: ${error.message}`);
      throw new BadRequestException(`Failed to generate or send certificate: ${error.message}`);
    }
  }
}
