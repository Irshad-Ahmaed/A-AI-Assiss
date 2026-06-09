import { Router } from 'express';
import { getFaculty, createFaculty, deleteFaculty } from '../controllers/faculty';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole(['ADMIN', 'HOD', 'DEAN', 'COORDINATOR', 'PROFESSOR']), getFaculty);
router.post('/', requireRole(['ADMIN', 'HOD']), createFaculty);
router.delete('/:id', requireRole(['ADMIN', 'HOD']), deleteFaculty);

export default router;
