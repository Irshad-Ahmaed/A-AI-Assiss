import { Request, Response } from 'express';
import { ingestionQueue, INGESTION_QUEUE_NAME } from '../workers/ingestionQueue';
import { QueueEvents } from 'bullmq';
import { redisConnection } from '../utils/redis';

const queueEvents = new QueueEvents(INGESTION_QUEUE_NAME, { connection: redisConnection as any });

export const startIngestion = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer.toString('base64');
    const fileName = req.file.originalname;

    const job = await ingestionQueue.add('parse-timetable', {
      fileBuffer,
      fileName,
    });

    return res.status(200).json({ jobId: job.id, status: 'queued' });
  } catch (error) {
    console.error('Ingestion start error:', error);
    return res.status(500).json({ error: 'Failed to start ingestion job' });
  }
};

export const getIngestionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await ingestionQueue.getJob(id as string);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress;
    const progressObj = progress as any;

    let status = 'queued';
    let summary = null;

    if (state === 'active') {
      status = progressObj && progressObj.status ? progressObj.status : 'parsing';
    } else if (state === 'completed') {
      status = 'done';
      summary = job.returnvalue?.summary || (progressObj ? progressObj.summary : null);
    } else if (state === 'failed') {
      status = 'error';
    } else if (state === 'delayed' || state === 'waiting') {
      status = 'queued';
    }

    return res.status(200).json({
      status,
      summary,
      message: job.failedReason,
    });
  } catch (error) {
    console.error('Ingestion status error:', error);
    return res.status(500).json({ error: 'Failed to retrieve ingestion status' });
  }
};
