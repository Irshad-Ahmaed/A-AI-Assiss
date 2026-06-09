import { Router } from 'express';
import {
  getRoomUtilisation,
  getEmptyProbability,
  getUnderRunningCourses,
  getEmptyRoomHours
} from '../controllers/analyticsController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/utilisation', authMiddleware, getRoomUtilisation);
router.get('/empty-probability', authMiddleware, getEmptyProbability);
router.get('/under-running', authMiddleware, getUnderRunningCourses);
router.get('/empty-hours', authMiddleware, getEmptyRoomHours);

export default router;
