import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
const redisPassword = process.env.REDIS_PASSWORD;

export const redisConnection = redisUrl 
  ? new Redis(redisUrl, { maxRetriesPerRequest: null })
  : new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword || undefined,
      maxRetriesPerRequest: null,
    });
