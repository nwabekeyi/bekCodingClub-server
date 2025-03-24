// src/modules/task/task.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/core/service/prisma.service';
import { CustomLogger } from 'src/core/logger';
import { CodeQueryRequest } from './task.interface';
import { CodeResponseDto } from './task.dto';
import axios from 'axios';

@Injectable()
export class TaskService {
  private readonly logger = new CustomLogger(TaskService.name);
  private readonly apiUrl = 'https://chatgpt4-ai-chatbot.p.rapidapi.com/ask';
  private readonly apiKey = process.env.AI_API_KEY;

  constructor(private readonly prisma: PrismaService) {
    this.logger.debug(`Initialized TaskService with API Key: ${this.apiKey || 'NOT SET'}`);
    if (!this.apiKey) {
      this.logger.error('AI_API_KEY is not set in environment variables');
    }
  }

  async processCodeQuery(request: CodeQueryRequest): Promise<CodeResponseDto> {
    const { query, files, criteria, userId, currentTopicId, lastTaskId } = request;

    if (!query && (!files || files.length === 0)) {
      throw new BadRequestException('Either query or files must be provided');
    }

    if (!criteria) {
      throw new BadRequestException('Grading criteria is required');
    }

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!currentTopicId || isNaN(currentTopicId)) {
      throw new BadRequestException('Valid current topic ID is required');
    }

    if (lastTaskId === undefined || isNaN(lastTaskId)) {
      throw new BadRequestException('Valid last task ID is required');
    }

    let parsedUserId: number;
    if (typeof userId === 'string') {
      parsedUserId = parseInt(userId, 10);
      if (isNaN(parsedUserId)) {
        throw new BadRequestException('Invalid User ID');
      }
    } else if (typeof userId === 'number') {
      parsedUserId = userId;
    } else {
      throw new BadRequestException('User ID must be a string or number');
    }

    const user = await this.prisma.user.findUnique({ where: { id: parsedUserId } });
    if (!user) {
      throw new BadRequestException(`User with ID ${parsedUserId} not found`);
    }

    let finalQuery = '';

    if (files && files.length > 0) {
      if (files.length > 2) {
        throw new BadRequestException('Maximum of 2 files (HTML and CSS) allowed');
      }

      const fileContents = files.map((file) => ({
        name: file.originalname,
        content: file.buffer.toString('utf-8'),
      }));

      if (files.length === 2) {
        const htmlFile = fileContents.find((f) => f.name.endsWith('.html'));
        const cssFile = fileContents.find((f) => f.name.endsWith('.css'));
        if (!htmlFile || !cssFile) {
          throw new BadRequestException('Two files must be HTML and CSS');
        }
        finalQuery = `HTML Code:\n${htmlFile.content}\n\nCSS Code:\n${cssFile.content}`;
      } else {
        finalQuery = fileContents[0].content;
      }
    } else {
      finalQuery = query!;
    }

    const aiInstructions = `
      You are an AI code reviewer. Review the following code and assign it a score out of 100 based on the provided criteria.
      Return your response in this format: 
      Score: <number>
      Hints: <improvement suggestions>
      After reviewing, provide a detailed explanation.
      Here is the code to review:\n${finalQuery}\n\nGrading Criteria:\n${criteria}
    `;

    this.logger.debug(`Final query sent to AI: ${aiInstructions}`);

    try {
      const response = await axios.post(
        this.apiUrl,
        { query: aiInstructions }, // Exact body format as curl
        {
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'chatgpt4-ai-chatbot.p.rapidapi.com',
            'x-rapidapi-key': this.apiKey,
          },
        },
      );

      const aiResponse = response.data.response;
      this.logger.debug(`AI response: ${aiResponse}`);

      const scoreMatch = aiResponse.match(/Score: (\d+)/);
      const hintsMatch = aiResponse.match(/Hints: (.+?)(?=\n|$)/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
      const hints = hintsMatch ? hintsMatch[1] : 'No hints provided';

      const updatedUser = await this.prisma.$transaction(async (prisma) => {
        await prisma.codeQuery.create({
          data: {
            query: query || null,
            fileContent: files ? finalQuery : null,
            fileNames: files ? files.map((f) => f.originalname) : [],
            criteria,
            score,
            hints,
            userId: parsedUserId,
          },
        });

        const newTotalScore = user.totalScore + score;
        const newLastTaskId = lastTaskId + 1;
        const newAverageScore = newLastTaskId > 0 ? newTotalScore / newLastTaskId : 0;

        return prisma.user.update({
          where: { id: parsedUserId },
          data: {
            totalScore: newTotalScore,
            averageScore: newAverageScore,
            lastTaskId: newLastTaskId,
            currentTopicId: currentTopicId,
          },
        });
      });

      this.logger.debug(`Updated user - Total Score: ${updatedUser.totalScore}, Average Score: ${updatedUser.averageScore}`);

      return {
        score,
        hints,
        response: aiResponse,
        totalScore: updatedUser.totalScore,
        averageScore: updatedUser.averageScore,
      };
    } catch (error) {
      this.logger.error(`API call failed: ${error.message}`);
      this.logger.error(`Response status: ${error.response?.status}, Response data: ${JSON.stringify(error.response?.data)}`);
      throw new BadRequestException(`API call failed: ${error.message}`);
    }
  }
}