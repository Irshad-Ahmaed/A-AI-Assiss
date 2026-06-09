import { Router } from 'express';
import multer from 'multer';
import { startIngestion, getIngestionStatus } from '../controllers/ingestionController';
import { authMiddleware } from '../middlewares/auth';
import { rbacMiddleware } from '../middlewares/rbac';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authMiddleware, rbacMiddleware(['ADMIN']), upload.single('file'), startIngestion);
router.get('/:id', authMiddleware, rbacMiddleware(['ADMIN']), getIngestionStatus);

export default router;
