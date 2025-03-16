import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { FetchPdfPagesDto, PostPdfFileDto } from './pdf.dto';
import { CustomLogger } from 'src/core/logger';

interface UploadResponse {
  public_id: string;
  secure_url: string;
}

@Injectable()
export class FileService {
  private readonly logger = new CustomLogger(FileService.name);

  private readonly ALLOWED_MIME_TYPES = [
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/pdf', // .pdf
    'text/html', // .html
    'text/css', // .css
    'application/javascript', // .js
  ];

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  getPageUrls({ publicId, pages }: FetchPdfPagesDto): string[] {
    this.logger.debug(`Fetching page URLs for publicId: ${publicId}, pages: ${pages}`);
    let pageNumbers: number[];

    if (pages.includes('-')) {
      const [start, end] = pages.split('-').map(Number);
      if (isNaN(start) || isNaN(end) || start > end || start < 1) {
        this.logger.error(`Invalid page range: ${pages}`);
        throw new BadRequestException('Invalid page range');
      }
      pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    } else {
      pageNumbers = pages.split(',').map(Number);
      if (pageNumbers.some((num) => isNaN(num) || num < 1)) {
        this.logger.error(`Invalid page numbers: ${pages}`);
        throw new BadRequestException('Invalid page numbers');
      }
    }

    const pageUrls = pageNumbers.map((page) =>
      cloudinary.url(publicId, {
        resource_type: 'image', // Must match upload resource_type for PDFs
        format: 'jpg',
        transformation: [{ page: page }],
      }),
    );

    this.logger.log(`Generated ${pageUrls.length} page URLs for publicId: ${publicId}`);
    this.logger.debug(`Generated URLs:',${pageUrls}`); // Log URLs for debugging
    return pageUrls;
  }

  async uploadFileToCloudinary(metadata: PostPdfFileDto): Promise<UploadResponse> {
    this.logger.debug('Starting upload process');

    const { file, title, description } = metadata;

    if (!file) {
      this.logger.error('No file provided in request');
      throw new BadRequestException('No file provided');
    }

    console.log('File object:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer,
    });

    if (!file.buffer || !file.mimetype || !file.originalname) {
      this.logger.error('Invalid file structure: missing buffer, mimetype, or originalname');
      throw new BadRequestException('Invalid file structure: missing required properties');
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      this.logger.error(`Invalid file type: ${file.mimetype}. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`);
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // Conditionally set resource_type based on MIME type
    const resourceType = file.mimetype === 'application/pdf' ? 'image' : 'raw';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType, // 'image' for PDFs, 'raw' for others
          public_id: title || `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          folder: 'uploads',
          context: { title, description },
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`, error.stack);
            return reject(new BadRequestException(`Upload to Cloudinary failed: ${error.message}`));
          }

          if (!result || !result.public_id || !result.secure_url) {
            this.logger.error(`Invalid response from Cloudinary:', ${result}`);
            return reject(new BadRequestException('Upload failed: Invalid response from Cloudinary'));
          }

          this.logger.log(`File uploaded successfully. Public ID: ${result.public_id}, URL: ${result.secure_url}`);
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
          });
        },
      );

      const stream = streamifier.createReadStream(file.buffer);
      stream.on('error', (streamErr) => {
        this.logger.error(`Stream error: ${streamErr.message}`);
        reject(new BadRequestException(`Stream error: ${streamErr.message}`));
      });
      stream.pipe(uploadStream);
    });
  }
}