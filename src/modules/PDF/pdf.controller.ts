import { Controller, Get, Post, UsePipes, ValidationPipe, UploadedFile, UseInterceptors, Body, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileService } from './pdf.service';
import { FetchPdfPagesDto, PostPdfFileDto } from './pdf.dto';
import { PdfPageUrls } from './pdf.interface';

@ApiTags('Files') // Updated to reflect multiple file types
@Controller('pdf')
export class PdfController {
  constructor(private readonly fileService: FileService) {}

  @Get('pages')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Get URLs for specific pages of a PDF from Cloudinary' })
  @ApiResponse({ status: 200, description: 'URLs of specified pages retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid pages parameter or publicId.' })
  async fetchPdfPageUrls(@Query() fetchPdfPagesDto: FetchPdfPagesDto): Promise<PdfPageUrls> {
    return { urls: this.fileService.getPageUrls(fetchPdfPagesDto) };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload with optional metadata (Docs, PDF, HTML, CSS, JS)',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload (Docs, PDF, HTML, CSS, JS)',
        },
        title: { type: 'string', description: 'Optional title', nullable: true },
        description: { type: 'string', description: 'Optional description', nullable: true },
      },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Upload a file (Docs, PDF, HTML, CSS, JS) to Cloudinary' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid file type or upload parameters.' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: Omit<PostPdfFileDto, 'file'>,
  ): Promise<{ publicId: string; url: string }> {
    const { title, description } = metadata;
    const completeMetadata: PostPdfFileDto = { file, title, description };
    const result = await this.fileService.uploadFileToCloudinary(completeMetadata);
    return { publicId: result.public_id, url: result.secure_url };
  }
}