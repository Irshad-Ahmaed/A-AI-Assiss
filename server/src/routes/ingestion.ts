import { Router } from 'express';
import multer from 'multer';
import { startIngestion, getIngestionStatus } from '../controllers/ingestionController';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authMiddleware, requireRole(['ADMIN']), upload.single('file'), startIngestion);
router.get('/:id', authMiddleware, requireRole(['ADMIN']), getIngestionStatus);

export default router;
