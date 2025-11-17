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

    // Convert BigInt to string for JSON serialization
    const userDataResponse = {
      ...userData,
      timerStartTime: userData.timerStartTime ? userData.timerStartTime.toString() : null,
      goalCreatedAt: userData.goalCreatedAt ? userData.goalCreatedAt.toString() : null,
    };
    
    return NextResponse.json(userDataResponse);
  } catch (error) {
    console.error('Error fetching data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
    const status = errorMessage.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status }
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

    // Build update object only with provided fields
    const updateData: any = {};
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
    if (data.currentTask !== undefined) updateData.currentTask = data.currentTask;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.timer !== undefined) updateData.timer = data.timer;
    if (data.timerStartTime !== undefined) {
      updateData.timerStartTime = data.timerStartTime ? BigInt(data.timerStartTime) : null;
    }
    if (data.showMinerals !== undefined) updateData.showMinerals = data.showMinerals;
    if (data.taskHistoryMinimized !== undefined) updateData.taskHistoryMinimized = data.taskHistoryMinimized;
    if (data.openLoopsMinimized !== undefined) updateData.openLoopsMinimized = data.openLoopsMinimized;
    if (data.goalTarget !== undefined) updateData.goalTarget = data.goalTarget;
    if (data.goalMotivation !== undefined) updateData.goalMotivation = data.goalMotivation;
    if (data.goalCreatedAt !== undefined) {
      updateData.goalCreatedAt = data.goalCreatedAt ? BigInt(data.goalCreatedAt) : null;
    }

    const userData = await prisma.userData.upsert({
      where: { userId: user.id },
      update: updateData,
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
        goalTarget: data.goalTarget ?? null,
        goalMotivation: data.goalMotivation ?? null,
        goalCreatedAt: data.goalCreatedAt ? BigInt(data.goalCreatedAt) : null,
      },
    });

    // Convert BigInt to string for JSON serialization
    const userDataResponse = {
      ...userData,
      timerStartTime: userData.timerStartTime ? userData.timerStartTime.toString() : null,
      goalCreatedAt: userData.goalCreatedAt ? userData.goalCreatedAt.toString() : null,
    };
    
    return NextResponse.json(userDataResponse);
  } catch (error) {
    console.error('Error saving data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save data';
    const status = errorMessage.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}

