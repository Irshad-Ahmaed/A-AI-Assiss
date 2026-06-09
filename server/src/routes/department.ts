import { Router } from 'express';
import { getDepartments, createDepartment, deleteDepartment } from '../controllers/department';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole(['ADMIN', 'HOD', 'DEAN', 'COORDINATOR']), getDepartments);
router.post('/', requireRole(['ADMIN']), createDepartment);
router.delete('/:id', requireRole(['ADMIN']), deleteDepartment);

export default router;
