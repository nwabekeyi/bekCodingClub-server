import { Logger } from '@nestjs/common';
import * as path from 'path';

export class CustomLogger extends Logger {
  private getCallerFile(): string {
    const originalFunc = Error.prepareStackTrace;

    try {
      const err = new Error();
      Error.prepareStackTrace = (_, stack) => stack;
      const stack = err.stack as unknown as NodeJS.CallSite[];
      Error.prepareStackTrace = originalFunc;

      // Find the first file outside this logger file to get the actual source of the log
      for (const callSite of stack) {
        const fileName = callSite.getFileName();
        if (fileName && !fileName.includes(__filename)) {
          const line = callSite.getLineNumber();
          const relativePath = path.relative(process.cwd(), fileName);
          return `${relativePath}:${line}`;
        }
      }
    } catch (e) {
      // Ignore error and fall back to basic logger
    }

    return '';
  }

  log(message: string) {
    const caller = this.getCallerFile();
    super.log(`${message} (${caller})`);
  }

  error(message: string, trace?: string) {
    const caller = this.getCallerFile();
    super.error(`${message} (${caller})`, trace);
  }

  warn(message: string) {
    const caller = this.getCallerFile();
    super.warn(`${message} (${caller})`);
  }

  debug(message: string) {
    const caller = this.getCallerFile();
    super.debug(`${message} (${caller})`);
  }

  verbose(message: string) {
    const caller = this.getCallerFile();
    super.verbose(`${message} (${caller})`);
  }
}
