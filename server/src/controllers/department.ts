import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';

const DepartmentSchema = z.object({
  name: z.string().min(2),
  shortCode: z.string().min(2).toUpperCase(),
});

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { shortCode: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { rooms: true, branches: true } } },
      }),
      prisma.department.count({ where }),
    ]);

    res.json({
      data: departments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const data = DepartmentSchema.parse(req.body);

    const existing = await prisma.department.findUnique({ where: { shortCode: data.shortCode } });
    if (existing) {
      return res.status(400).json({ error: 'Department with this shortCode already exists' });
    }

    const department = await prisma.department.create({ data });
    res.status(201).json(department);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // Check for dependencies
    const dept = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { rooms: true, branches: true } } }
    }) as any;

    if (!dept) return res.status(404).json({ error: 'Not found' });
    if (dept._count.rooms > 0 || dept._count.branches > 0) {
      return res.status(400).json({ error: 'Cannot delete department with existing rooms or branches' });
    }

    await prisma.department.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
