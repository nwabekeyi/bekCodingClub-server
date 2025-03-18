import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { IEmailOptions, IEmailService } from './interfaces';
import { join } from 'path';
import * as ejs from 'ejs';

@Injectable()
export class EmailService implements IEmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(options: IEmailOptions): Promise<void> {
    try {
      const templatePath = join(__dirname, '../../public/emailTemplates', `${options.template}.ejs`);
      const htmlContent: string = await ejs.renderFile(templatePath, options.context);

      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        html: htmlContent,
      });

      console.log(`Email sent successfully to: ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}