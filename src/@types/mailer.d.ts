// types/mailer.d.ts

declare module '@nestjs-modules/mailer' {
    import { SendMailOptions } from 'nodemailer';
  
    export interface ISendMailOptions extends SendMailOptions {}
  
    export class MailerService {
      sendMail(options: ISendMailOptions): Promise<any>;
    }
  
    export interface MailerOptions {
      transport: any;
      defaults?: ISendMailOptions;
      template?: {
        dir: string;
        adapter: any;
        options?: {
          strict?: boolean;
        };
      };
    }
  
    export class MailerModule {
      static forRoot(options: MailerOptions): DynamicModule;
      static forRootAsync(options: any): DynamicModule;
    }
  }
  