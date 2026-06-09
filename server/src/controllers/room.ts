import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';

const RoomSchema = z.object({
  roomNumber: z.string().min(1),
  capacity: z.number().int().positive(),
  type: z.enum(['CLASSROOM', 'LAB', 'OTHER']),
  departmentId: z.string().uuid(),
});

export const getRooms = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const departmentId = req.query.departmentId as string | undefined;

    const where = {
      ...(departmentId ? { departmentId } : {}),
      ...(search ? { roomNumber: { contains: search, mode: 'insensitive' as const } } : {}),
    };

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { roomNumber: 'asc' },
        include: { department: { select: { name: true, shortCode: true } } },
      }),
      prisma.room.count({ where }),
    ]);

    res.json({
      data: rooms,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const data = RoomSchema.parse(req.body);

    const existing = await prisma.room.findUnique({
      where: {
        roomNumber_departmentId: {
          roomNumber: data.roomNumber,
          departmentId: data.departmentId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Room with this number already exists in the department' });
    }

    const room = await prisma.room.create({ data });
    res.status(201).json(room);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // In actual implementation, we'd check if room has upcoming slots
    await prisma.room.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
