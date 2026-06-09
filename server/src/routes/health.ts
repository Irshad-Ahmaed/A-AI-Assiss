import { Router } from 'express';
import prisma from '../prisma';
import { redisConnection } from '../utils/redis';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Ping DB
    await prisma.$queryRaw`SELECT 1`;
    
    // Ping Redis
    await redisConnection.ping();
    
    res.json({ 
      status: 'ok', 
      db: 'connected',
      redis: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
