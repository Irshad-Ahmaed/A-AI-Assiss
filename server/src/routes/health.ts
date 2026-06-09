import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Ping DB
    await prisma.$queryRaw`SELECT 1`;
    
    // In future: Ping Redis (Queue)
    
    res.json({ 
      status: 'ok', 
      db: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      db: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
