import { Controller, Post, UseInterceptors, UploadedFiles, UploadedFile, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CodeReviewDto, CodeResponseDto, SubmitFinalProjectDto } from './task.dto';

@ApiTags('Task Review')
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

  @Post('final-project')
  @UseInterceptors(FileInterceptor('projectPicture')) // Single file upload
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Submit final project with a URL, user ID, and picture file',
    schema: {
      type: 'object',
      properties: {
        projectUrl: {
          type: 'string',
          description: 'URL of the final project',
          format: 'url',
        },
        userId: {
          type: 'integer',
          description: 'ID of the user submitting the project',
        },
        projectPicture: {
          type: 'string',
          format: 'binary',
          description: 'Project picture file (e.g., JPG, PNG)',
        },
      },
      required: ['projectUrl', 'userId', 'projectPicture'],
    },
  })
  @ApiOperation({ summary: 'Submit final project with URL and picture' })
  @ApiResponse({ status: 201, description: 'Final project submitted successfully', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitFinalProject(
    @Body() submitFinalProjectDto: SubmitFinalProjectDto,
    @UploadedFile() projectPicture: Express.Multer.File,
  ) {
    return this.codeService.submitFinalProject(submitFinalProjectDto.projectUrl, projectPicture, submitFinalProjectDto.userId);
  }
}