import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../utils/redis';
import pdfParse from 'pdf-parse';
import { prisma } from '../prisma';

export const INGESTION_QUEUE_NAME = 'timetable-ingestion';

export const ingestionQueue = new Queue(INGESTION_QUEUE_NAME, {
  connection: redisConnection,
});

export interface IngestionJobData {
  fileBuffer: string; // Base64 encoded
  fileName: string;
}

export const ingestionWorker = new Worker(
  INGESTION_QUEUE_NAME,
  async (job: Job<IngestionJobData>) => {
    // 1. Parsing Phase
    await job.updateProgress({ status: 'parsing' });
    
    const buffer = Buffer.from(job.data.fileBuffer, 'base64');
    let text = '';
    try {
      const data = await pdfParse(buffer);
      text = data.text;
    } catch (error) {
      throw new Error('Failed to parse PDF.');
    }

    // 2. Integrating Phase
    await job.updateProgress({ status: 'integrating' });

    // Mock processing logic since extracting exact timetable structure is highly complex
    // and depends on the exact PDF format. For demonstration, we will just parse
    // out simple lines and pretend we found rooms/courses.
    
    // In a real app, you'd use a robust parser/LLM here.
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const summary = {
      created: { departments: 0, rooms: 0, courses: 0, faculty: 0 },
      matched: { departments: 1, rooms: 0, courses: 0, faculty: 0 },
      unparsed: [] as Array<{ reason: string; row?: string }>,
    };

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 2000));

    await job.updateProgress({ status: 'done', summary });

    return { summary };
  },
  { connection: redisConnection }
);
