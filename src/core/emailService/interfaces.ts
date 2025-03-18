// interfaces/EmailService.ts
export interface IEmailOptions {
    to: string;
    subject: string;
    template: string; // Path to the EJS template
    context: any;     // Data to be passed to the EJS template
  }

  export interface IEmailService {
    sendEmail(options: IEmailOptions): Promise<void>;
  }
