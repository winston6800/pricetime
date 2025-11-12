import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/clerk';
import { prisma } from '@/lib/db';

/**
 * GET /api/loops - Get user's open loops
 */
export async function GET() {
  try {
    const user = await requireAuth();
    
    const loops = await prisma.openLoop.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Convert BigInt to string for JSON
    const loopsWithStringTimestamp = loops.map(loop => ({
      ...loop,
      timerStartTime: loop.timerStartTime ? loop.timerStartTime.toString() : null,
    }));

    return NextResponse.json(loopsWithStringTimestamp);
  } catch (error) {
    console.error('Error fetching loops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loops' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loops - Create or update an open loop
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { id, name, timer, rate, isActive, timerStartTime } = await request.json();

    if (id) {
      // Update existing loop
      const loop = await prisma.openLoop.update({
        where: { id },
        data: {
          name: name ?? undefined,
          timer: timer ?? undefined,
          rate: rate ?? undefined,
          isActive: isActive ?? undefined,
          timerStartTime: timerStartTime ? BigInt(timerStartTime) : undefined,
        },
      });

      return NextResponse.json({
        ...loop,
        timerStartTime: loop.timerStartTime ? loop.timerStartTime.toString() : null,
      });
    } else {
      // Create new loop
      const loop = await prisma.openLoop.create({
        data: {
          userId: user.id,
          name: name || 'New Loop',
          timer: timer || 0,
          rate: rate || 1000,
          isActive: false,
          timerStartTime: timerStartTime ? BigInt(timerStartTime) : null,
        },
      });

      return NextResponse.json({
        ...loop,
        timerStartTime: loop.timerStartTime ? loop.timerStartTime.toString() : null,
      });
    }
  } catch (error) {
    console.error('Error saving loop:', error);
    return NextResponse.json(
      { error: 'Failed to save loop' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/loops - Delete an open loop
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const loopId = searchParams.get('id');

    if (!loopId) {
      return NextResponse.json(
        { error: 'Loop ID required' },
        { status: 400 }
      );
    }

    // Verify loop belongs to user
    const loop = await prisma.openLoop.findUnique({
      where: { id: loopId },
    });

    if (!loop || loop.userId !== user.id) {
      return NextResponse.json(
        { error: 'Loop not found' },
        { status: 404 }
      );
    }

    await prisma.openLoop.delete({
      where: { id: loopId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting loop:', error);
    return NextResponse.json(
      { error: 'Failed to delete loop' },
      { status: 500 }
    );
  }
}

