import { Router } from 'express';
import { getCourses, createCourse, deleteCourse } from '../controllers/course';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole(['ADMIN', 'HOD', 'DEAN', 'COORDINATOR', 'PROFESSOR']), getCourses);
router.post('/', requireRole(['ADMIN', 'HOD', 'COORDINATOR']), createCourse);
router.delete('/:id', requireRole(['ADMIN', 'HOD', 'COORDINATOR']), deleteCourse);

export default router;
