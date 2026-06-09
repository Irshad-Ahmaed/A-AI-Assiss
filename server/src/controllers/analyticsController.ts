import { Request, Response } from 'express';
import prisma from '../prisma';
import { RoomType, CourseType } from '@prisma/client';

// 1. Room Utilisation (Overall & Per-Room)
export const getRoomUtilisation = async (req: Request, res: Response) => {
  try {
    const roomCount = await prisma.room.count();
    const slotCount = await prisma.timetableSlot.count();

    const roomUtilisation = roomCount > 0 ? (slotCount / (roomCount * 45)) * 100 : 0;

    const rooms = await prisma.room.findMany({
      include: {
        _count: {
          select: { slots: true },
        },
      },
    });

    const perRoom = rooms
      .map((r) => ({
        room: r.roomNumber,
        utilisation: roomCount > 0 ? Math.round((r._count.slots / 45) * 100 * 10) / 10 : 0,
      }))
      .sort((a, b) => b.utilisation - a.utilisation);

    return res.status(200).json({
      roomUtilisation,
      perRoom,
    });
  } catch (error) {
    console.error('Error fetching room utilisation analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Empty Room Probability by Period
export const getEmptyProbability = async (req: Request, res: Response) => {
  try {
    const roomCount = await prisma.room.count();
    const slots = await prisma.timetableSlot.findMany({
      select: { period: true },
    });

    const counts = Array(10).fill(0);
    slots.forEach((s) => {
      if (s.period >= 1 && s.period <= 9) {
        counts[s.period]++;
      }
    });

    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    const emptyProbability = [];
    for (let p = 1; p <= 9; p++) {
      const occupied = counts[p];
      const total = roomCount * 5;
      const probability = total > 0 ? (total - occupied) / total : 1.0;
      emptyProbability.push({
        slot: romanNumerals[p],
        probability: Math.round(probability * 100) / 100,
      });
    }

    return res.status(200).json({
      emptyProbability,
    });
  } catch (error) {
    console.error('Error fetching empty room probability analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Under-running Courses
export const getUnderRunningCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: { slots: true },
        },
      },
    });

    const underRunning = courses
      .map((c) => {
        const gap = c.credits - c._count.slots;
        return {
          code: c.code,
          name: c.name,
          gap: gap > 0 ? gap : 0,
        };
      })
      .filter((c) => c.gap > 0);

    return res.status(200).json({
      underRunning,
    });
  } catch (error) {
    console.error('Error fetching under-running courses analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. Avg Empty Room-Hours / Day
export const getEmptyRoomHours = async (req: Request, res: Response) => {
  try {
    const roomCount = await prisma.room.count();
    const slotCount = await prisma.timetableSlot.count();

    const avgEmptyRoomHours = (roomCount > 0 ? 9 - slotCount / (roomCount * 5) : 9) * (50 / 60);

    return res.status(200).json({
      avgEmptyRoomHours,
    });
  } catch (error) {
    console.error('Error fetching empty room hours analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
