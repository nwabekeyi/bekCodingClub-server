import { Controller, Post, UseInterceptors, UploadedFiles, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CodeReviewDto, CodeResponseDto } from './task.dto';

@ApiTags('task Review')
@Controller('task')
export class TaskController {
  constructor(private readonly codeService: TaskService) {}

  @Post('review')
  @UseInterceptors(FilesInterceptor('files', 2)) // Max 2 files
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Submit code as a string or files (HTML/CSS) with grading criteria and user ID',
    schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Direct code query (optional if files are provided)',
          nullable: true,
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Up to 2 files (HTML and CSS)',
          maxItems: 2,
        },
        criteria: {
          type: 'string',
          description: 'Grading criteria',
        },
        userId: {
          type: 'integer',
          description: 'ID of the user submitting the query',
        },
        currentTopicId: {
          type: 'integer',
          description: 'Current topic ID',
        },
        lastTaskId: {
          type: 'integer',
          description: 'Last completed task ID',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Review code and get a score with improvement hints' })
  @ApiResponse({ status: 201, description: 'Code reviewed successfully', type: CodeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async reviewCode(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() codeReviewDto: CodeReviewDto,
  ): Promise<CodeResponseDto> {
    const request = {
      query: codeReviewDto.query,
      files: files && files.length > 0 ? files : undefined,
      criteria: codeReviewDto.criteria,
      userId: parseInt(codeReviewDto.userId.toString()),
      currentTopicId: parseInt(codeReviewDto.currentTopicId.toString()),
      lastTaskId: parseInt(codeReviewDto.lastTaskId.toString()),
    };
    return this.codeService.processCodeQuery(request);
  }
}