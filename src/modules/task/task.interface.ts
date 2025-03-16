export interface CodeQueryRequest {
    query?: string; // Direct query string
    files?: Express.Multer.File[]; // Uploaded files (optional)
    criteria: string; // Grading criteria
    userId: number; // User ID to link the query
  }
  
  // No need for CodeQueryResponse since CodeResponseDto replaces it