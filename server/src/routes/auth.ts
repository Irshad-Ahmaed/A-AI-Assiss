import { Router } from 'express';
import { login, getMe } from '../controllers/auth';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authMiddleware, getMe);

export default router;
