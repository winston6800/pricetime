import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/clerk';
import { prisma } from '@/lib/db';

/**
 * GET /api/data - Get user's data
 */
export async function GET() {
  try {
    const user = await requireAuth();
    
    // Get or create user data
    let userData = await prisma.userData.findUnique({
      where: { userId: user.id },
    });

    // If no data exists, create default
    if (!userData) {
      userData = await prisma.userData.create({
        data: {
          userId: user.id,
          hourlyRate: 90,
          currentTask: '',
          category: 'rock',
          timer: 0,
          showMinerals: true,
          taskHistoryMinimized: false,
          openLoopsMinimized: false,
          loginStreak: 1,
          lastLoginDate: new Date().toDateString(),
        },
      });
    }

    // Update login streak
    const currentDate = new Date().toDateString();
    if (userData.lastLoginDate !== currentDate) {
      const lastLoginTime = userData.lastLoginDate 
        ? new Date(userData.lastLoginDate).getTime()
        : 0;
      const currentTime = new Date().getTime();
      const daysDiff = Math.floor((currentTime - lastLoginTime) / (1000 * 60 * 60 * 24));
      
      let newStreak = 1;
      if (daysDiff === 1) {
        newStreak = userData.loginStreak + 1;
      }
      
      userData = await prisma.userData.update({
        where: { userId: user.id },
        data: {
          loginStreak: newStreak,
          lastLoginDate: currentDate,
        },
      });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/data - Save/update user's data
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await request.json();

    const userData = await prisma.userData.upsert({
      where: { userId: user.id },
      update: {
        hourlyRate: data.hourlyRate ?? undefined,
        currentTask: data.currentTask ?? undefined,
        category: data.category ?? undefined,
        timer: data.timer ?? undefined,
        timerStartTime: data.timerStartTime ? BigInt(data.timerStartTime) : undefined,
        showMinerals: data.showMinerals ?? undefined,
        taskHistoryMinimized: data.taskHistoryMinimized ?? undefined,
        openLoopsMinimized: data.openLoopsMinimized ?? undefined,
      },
      create: {
        userId: user.id,
        hourlyRate: data.hourlyRate ?? 90,
        currentTask: data.currentTask ?? '',
        category: data.category ?? 'rock',
        timer: data.timer ?? 0,
        timerStartTime: data.timerStartTime ? BigInt(data.timerStartTime) : null,
        showMinerals: data.showMinerals ?? true,
        taskHistoryMinimized: data.taskHistoryMinimized ?? false,
        openLoopsMinimized: data.openLoopsMinimized ?? false,
        loginStreak: 1,
        lastLoginDate: new Date().toDateString(),
      },
    });

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}

