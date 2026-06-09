import { Router } from 'express';
import { getRooms, createRoom, deleteRoom } from '../controllers/room';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole(['ADMIN', 'HOD', 'DEAN', 'COORDINATOR', 'PROFESSOR']), getRooms);
router.post('/', requireRole(['ADMIN', 'HOD']), createRoom);
router.delete('/:id', requireRole(['ADMIN', 'HOD']), deleteRoom);

export default router;
