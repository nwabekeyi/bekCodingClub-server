import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { CertificateService } from './generateCertificate.service';
import { GenerateCertificateDto } from './generateCertificate.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AdminGuard } from '../auth/auth.authGard';

@ApiTags('Certificates')
@Controller('certificate')
@UseGuards(AdminGuard)
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate and send a certificate download link via email' })
  @ApiBody({ type: GenerateCertificateDto })
  @ApiResponse({ status: 201, description: 'Certificate link sent successfully', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateAndSendCertificate(@Body() generateCertificateDto: GenerateCertificateDto) {
    return this.certificateService.generateAndSendCertificate(generateCertificateDto);
  }
}