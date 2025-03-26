// src/modules/task/task.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/core/service/prisma.service';
import { CustomLogger } from 'src/core/logger';
import { CodeQueryRequest } from './task.interface';
import axios from 'axios';

@Injectable()
export class TaskService {
  private readonly logger = new CustomLogger(TaskService.name);
  private readonly apiUrl = 'https://api.aimlapi.com/v1/chat/completions';
  private readonly apiKey = process.env.AI_API_KEY;

  constructor(private readonly prisma: PrismaService) {
    this.logger.debug(`Initialized TaskService with API Key: ${this.apiKey}`);
    if (!this.apiKey) {
      this.logger.error('AI_API_KEY is not set in environment variables');
    }
  }

  async processCodeQuery(request: CodeQueryRequest): Promise<{ score: number; hints: string; updatedUser?: any }> {
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

    const parsedUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
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
        finalQuery = `HTML:\n${htmlFile.content}\nCSS:\n${cssFile.content}`;
      } else {
        finalQuery = fileContents[0].content;
      }
    } else {
      finalQuery = query!;
    }

    const aiInstructions = `
      Review this code, score it 0-100 based on criteria.
      Format: Score: <number>
      Hints: <suggestions>
      Explanation follows.
      Code:\n${finalQuery}\nCriteria:\n${criteria}
    `;

    this.logger.debug(`Final query sent to AI: ${aiInstructions}`);

    if (!this.apiKey) {
      throw new BadRequestException('AI_API_KEY is missing');
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'chatgpt-4o-latest',
          messages: [{ role: 'user', content: aiInstructions }],
          frequency_penalty: 1,
          logprobs: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      const aiResponse = response.data.choices?.[0]?.message?.content || response.data;
      const responseText = typeof aiResponse === 'string' ? aiResponse : aiResponse.text || JSON.stringify(aiResponse);
      const scoreMatch = responseText.match(/Score: (\d+)/);
      const hintsMatch = responseText.match(/Hints: (.+?)(?=\n|$)/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
      const hints = hintsMatch ? hintsMatch[1] : 'No hints provided';

      const PASSING_SCORE = 50; // Define passing threshold

      // Only update the user if the score is above 50
      let updatedUser: any;
      if (score > PASSING_SCORE) {
        updatedUser = await this.prisma.$transaction(async (prisma) => {
          await prisma.codeQuery.create({
            data: {
              query: query || null,
              fileContent: files ? finalQuery : null,
              fileNames: files ? files.map((f) => f.originalname) : [],
              criteria,
              score,
              hints: null, // No hint sent if score is above 50
              userId: parsedUserId,
            },
          });

          const newTotalScore = user.totalScore + score;
          const newLastTaskId = lastTaskId + 1;
          const newAverageScore = newLastTaskId > 0 ? newTotalScore / newLastTaskId : 0;
          const newCurrentTopicId = score >= PASSING_SCORE ? currentTopicId + 1 : currentTopicId; // Increment if passed

          return prisma.user.update({
            where: { id: parsedUserId },
            data: {
              totalScore: newTotalScore,
              averageScore: newAverageScore,
              lastTaskId: newLastTaskId,
              currentTopicId: newCurrentTopicId,
            },
          });
        });

        this.logger.debug(`Updated user - Total Score: ${updatedUser.totalScore}, Average Score: ${updatedUser.averageScore}`);
      }

      return {
        score,
        hints: score < PASSING_SCORE ? hints : '', // Send hints if score is less than 50
        updatedUser: score > PASSING_SCORE ? updatedUser : null, // Only update user if score is greater than 50
      };
    } catch (error) {
      this.logger.error(`API call failed: ${error.message}`);
      this.logger.error(`Response status: ${error.response?.status}, Response data: ${JSON.stringify(error.response?.data)}`);
      throw new BadRequestException(
        `API call failed: ${error.response?.status === 401 ? 'Invalid or unauthorized API key' : error.message}`
      );
    }
  }
}
