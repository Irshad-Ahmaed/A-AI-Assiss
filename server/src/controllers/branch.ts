import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';

const BranchSchema = z.object({
  name: z.string().min(2),
  departmentId: z.string().uuid(),
});

export const getBranches = async (req: Request, res: Response) => {
  try {
    const departmentId = req.query.departmentId as string | undefined;
    const where = departmentId ? { departmentId } : {};

    const branches = await prisma.branch.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { department: { select: { shortCode: true } } },
    });

    res.json({ data: branches });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBranch = async (req: Request, res: Response) => {
  try {
    const data = BranchSchema.parse(req.body);
    const branch = await prisma.branch.create({ data });
    res.status(201).json(branch);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBranch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.branch.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
