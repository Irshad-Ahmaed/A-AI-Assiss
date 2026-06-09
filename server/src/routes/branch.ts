import { Router } from 'express';
import { getBranches, createBranch, deleteBranch } from '../controllers/branch';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole(['ADMIN', 'HOD', 'DEAN', 'COORDINATOR', 'PROFESSOR']), getBranches);
router.post('/', requireRole(['ADMIN', 'HOD']), createBranch);
router.delete('/:id', requireRole(['ADMIN', 'HOD']), deleteBranch);

export default router;
