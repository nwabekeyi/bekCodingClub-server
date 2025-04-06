import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/core/service/prisma.service';
import { CustomLogger } from 'src/core/logger';
import { CodeQueryRequest } from './task.interface';
import { EmailService } from 'src/core/emailService';
import axios, { AxiosError } from 'axios';

@Injectable()
export class TaskService {
  private readonly logger = new CustomLogger(TaskService.name);

  // Define all five AI API configurations
  private readonly aiApis = [
    {
      name: 'AIML API',
      url: 'https://api.aimlapi.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
      },
      payload: (instructions: string) => ({
        model: 'chatgpt-4o-latest',
        messages: [{ role: 'user', content: instructions }],
        frequency_penalty: 1,
        logprobs: true,
      }),
      extractResponse: (response: any) => response.data.choices?.[0]?.message?.content || response.data,
    },
    {
      name: 'Llama Conversation API',
      url: 'https://open-ai21.p.rapidapi.com/conversationllama',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      },
      payload: (instructions: string) => ({
        messages: [{ role: 'user', content: instructions }],
        web_access: false,
      }),
      extractResponse: (response: any) => response.data.response || JSON.stringify(response.data),
    },
    {
      name: 'ChatGPT4 AI Chatbot API',
      url: 'https://chatgpt4-ai-chatbot.p.rapidapi.com/ask',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'chatgpt4-ai-chatbot.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      },
      payload: (instructions: string) => ({
        query: instructions,
      }),
      extractResponse: (response: any) => response.data.response || JSON.stringify(response.data),
    },
    {
      name: 'ChatGPT-42 AI to Human API',
      url: 'https://chatgpt-42.p.rapidapi.com/aitohuman',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      },
      payload: (instructions: string) => ({
        text: instructions,
      }),
      extractResponse: (response: any) => response.data.result || JSON.stringify(response.data),
    },
    {
      name: 'ChatGPT4o AI Chatbot API',
      url: 'https://chatgpt4o-ai-chatbot.p.rapidapi.com/chat.php',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'chatgpt4o-ai-chatbot.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      },
      payload: (instructions: string) => ({
        query: instructions,
      }),
      extractResponse: (response: any) => response.data.response || JSON.stringify(response.data),
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    this.logger.debug('Initialized TaskService with multiple AI APIs');
    if (!process.env.AI_API_KEY) {
      this.logger.warn('AI_API_KEY is not set; AIML API may fail');
    }
    if (!process.env.RAPIDAPI_KEY) {
      this.logger.warn('RAPIDAPI_KEY is not set; using fallback key for RapidAPI endpoints');
    }
  }

  // Helper method to call an AI API with retry logic
  private async callAiApi(api: any, instructions: string): Promise<string> {
    try {
      this.logger.debug(`Calling ${api.name} at ${api.url}`);
      const response = await axios.post(api.url, api.payload(instructions), { headers: api.headers });
      const responseText = api.extractResponse(response);
      this.logger.debug(`${api.name} response: ${responseText}`);
      return responseText;
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const message = axiosError.message || 'Unknown error';
      this.logger.error(`${api.name} failed: Status ${status}, Message: ${message}`);
      throw error; // Propagate error to trigger fallback
    }
  }

  // Updated processCodeQuery with sequential API fallback
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

    this.logger.debug(`Final query for AI: ${aiInstructions}`);

    // Try each API sequentially
    let aiResponseText: string | undefined;
    for (const api of this.aiApis) {
      try {
        aiResponseText = await this.callAiApi(api, aiInstructions);
        break; // Exit loop on success
      } catch (error) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        if (status && (status >= 400 || status === 401)) {
          this.logger.warn(`Skipping ${api.name} due to error (Status: ${status})`);
          continue; // Move to next API
        }
        throw error; // Non-recoverable error, stop retrying
      }
    }

    if (!aiResponseText) {
      throw new BadRequestException('All AI APIs failed to respond');
    }

    const scoreMatch = aiResponseText.match(/Score: (\d+)/);
    const hintsMatch = aiResponseText.match(/Hints: (.+?)(?=\n|$)/);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
    const hints = hintsMatch ? hintsMatch[1] : 'No hints provided';

    const PASSING_SCORE = 50;

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
            hints: null,
            userId: parsedUserId,
          },
        });

        const newTotalScore = user.totalScore + score;
        const newLastTaskId = lastTaskId + 1;
        const newAverageScore = newLastTaskId > 0 ? newTotalScore / newLastTaskId : 0;
        const newCurrentTopicId = score >= PASSING_SCORE ? currentTopicId + 1 : currentTopicId;

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
      hints: score < PASSING_SCORE ? hints : '',
      updatedUser: score > PASSING_SCORE ? updatedUser : null,
    };
  }

  // submitFinalProject remains unchanged
  async submitFinalProject(projectUrl: string, projectPicture: Express.Multer.File, userId: number) {
    if (!projectUrl) {
      throw new BadRequestException('Project URL is required');
    }
    if (!projectPicture) {
      throw new BadRequestException('Project picture file is required');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    const emailOptions = {
      to: 'chidi90simeon@gmail.com',
      subject: `Final Project Submission from ${user.firstName} ${user.lastName || ''}`,
      template: 'finalProjectSubmission',
      context: {
        firstName: user.firstName,
        lastName: user.lastName || '',
        projectUrl,
        userId,
      },
      attachments: [
        {
          filename: projectPicture.originalname,
          content: projectPicture.buffer,
          contentType: projectPicture.mimetype,
        },
      ],
    };

    try {
      await this.emailService.sendEmail(emailOptions);
      this.logger.debug(`Final project email sent for user ${userId}`);
      return { message: 'Final project submitted successfully' };
    } catch (error) {
      this.logger.error(`Failed to submit final project: ${error.message}`);
      throw new BadRequestException(`Failed to submit final project: ${error.message}`);
    }
  }
}