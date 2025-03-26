// src/modules/task/task.dto.ts
import { IsString, IsOptional, IsNotEmpty, MaxLength, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CodeReviewDto {
  @ApiPropertyOptional({
    description: 'Direct code query as a string (optional if files are provided)',
    example: 'function add(a, b) { return a + b; }',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10000, { message: 'Query must not exceed 10,000 characters' })
  query?: string;

  @ApiProperty({
    description: 'Grading criteria for the AI to evaluate the code',
    example: 'Check for readability, efficiency, and best practices',
  })
  @IsString()
  @IsNotEmpty({ message: 'Grading criteria is required' })
  @MaxLength(1000, { message: 'Criteria must not exceed 1,000 characters' })
  criteria: string;

  @ApiProperty({
    description: 'ID of the user submitting the code query',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;

  @ApiProperty({
    description: 'Current topic ID',
    example: 5,
  })
  @IsInt()
  @IsNotEmpty({ message: 'Current topic ID is required' })
  currentTopicId: number;

  @ApiProperty({
    description: 'Last task ID to calculate average score',
    example: 12,
  })
  @IsInt()
  @IsNotEmpty({ message: 'Last task ID is required' })
  lastTaskId: number;
}

export class CodeResponseDto {
  @ApiProperty({
    description: 'Score assigned by the AI (0-100)',
    example: 85,
  })
  @IsInt()
  score: number;

  @ApiProperty({
    description: 'Hints for improving the code',
    example: 'Use descriptive variable names instead of a, b',
  })
  @IsString()
  hints: string;

  @ApiPropertyOptional({
    description: 'Updated user object containing user details (optional)',
    example: { id: 1, totalScore: 200, averageScore: 70, lastTaskId: 12, currentTopicId: 6 },
    nullable: true,
  })
  @IsOptional() // Make updatedUser optional
  updatedUser?: any;
}
