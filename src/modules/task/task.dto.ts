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
}

export class CodeResponseDto {
  @ApiProperty({
    description: 'Score assigned by the AI (0-100)',
    example: 85,
  })
  score: number;

  @ApiProperty({
    description: 'Hints for improving the code',
    example: 'Use descriptive variable names instead of a, b',
  })
  hints: string;

  @ApiProperty({
    description: 'Full response from the AI, including score, hints, and explanation',
    example: 'Score: 85\nHints: Use descriptive variable names instead of a, b\nExplanation: ...',
  })
  response: string;
}