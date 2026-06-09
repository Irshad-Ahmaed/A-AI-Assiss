import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import prisma from '../prisma';

const FacultySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  departmentId: z.string().uuid(),
});

export const getFaculty = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const departmentId = req.query.departmentId as string | undefined;

    const where = {
      role: 'PROFESSOR' as const,
      ...(departmentId ? { departmentId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [faculty, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, email: true, role: true, department: { select: { name: true, shortCode: true } } },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: faculty,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createFaculty = async (req: Request, res: Response) => {
  try {
    const data = FacultySchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const faculty = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'PROFESSOR',
        departmentId: data.departmentId,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    res.status(201).json(faculty);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFaculty = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.user.delete({ where: { id, role: 'PROFESSOR' } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
