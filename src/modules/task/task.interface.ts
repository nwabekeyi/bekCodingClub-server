// src/modules/task/task.interface.ts
export interface CodeQueryRequest {
  query?: string;
  files?: Express.Multer.File[];
  criteria: string;
  userId: number;
  currentTopicId: number; // Add this
  lastTaskId: number;     // Add this
}