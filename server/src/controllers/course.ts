import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';

const CourseSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  credits: z.number().int().positive(),
  type: z.enum(['LECTURE', 'LAB', 'TUTORIAL']),
  semester: z.number().int().positive(),
  branchId: z.string().uuid(),
});

export const getCourses = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const branchId = req.query.branchId as string | undefined;

    const where = {
      ...(branchId ? { branchId } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: 'insensitive' as const } },
              { name: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ semester: 'asc' }, { code: 'asc' }],
        include: { branch: { select: { name: true, department: { select: { shortCode: true } } } } },
      }),
      prisma.course.count({ where }),
    ]);

    res.json({
      data: courses,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const data = CourseSchema.parse(req.body);

    const existing = await prisma.course.findUnique({
      where: {
        code_branchId_semester: {
          code: data.code,
          branchId: data.branchId,
          semester: data.semester,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Course with this code already exists for the branch and semester' });
    }

    const course = await prisma.course.create({ data });
    res.status(201).json(course);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.course.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
