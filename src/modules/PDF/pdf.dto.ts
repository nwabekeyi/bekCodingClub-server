import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FetchPdfPagesDto {
  @ApiProperty({
    description: 'The unique public identifier for the PDF document',
    example: '12345-abcdef',
  })
  @IsString()
  @IsNotEmpty()
  publicId: string;

  @ApiProperty({
    description: 'Pages to fetch (comma-separated numbers e.g., "1,3,5" or range e.g., "2-4")',
    example: '1,3,5',
  })
  @IsString()
  @IsNotEmpty()
  pages: string;
}

export class PostPdfFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The file to upload (Docs: .doc, .docx; PDF: .pdf; HTML: .html; CSS: .css; JS: .js)',
  })
  file: Express.Multer.File; // Multer file object

  @ApiProperty({
    description: 'Optional title for the uploaded file',
    example: 'My Document',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Optional description for the uploaded file',
    example: 'A sample file uploaded to Cloudinary.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}