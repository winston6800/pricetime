import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/clerk';
import { prisma } from '@/lib/db';
import { validateHourlyRate, validateCategory, validateGoalMotivation, validateMoneyAmount, validateTextField, validateTimestamp, validateDuration } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * GET /api/data - Get user's data
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Rate limiting
    const rateLimitKey = getRateLimitKey(user.id);
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.AUTHENTICATED);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) } }
      );
    }
    
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
      goalCreatedAt: (userData as any).goalCreatedAt ? (userData as any).goalCreatedAt.toString() : null,
    };
    
    return NextResponse.json(userDataResponse);
  } catch (error) {
    console.error('Error fetching data:', error);
    
    // Don't expose internal errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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
    
    // Rate limiting
    const rateLimitKey = getRateLimitKey(user.id);
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.AUTHENTICATED);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) } }
      );
    }
    
    const data = await request.json();

    // Build update object only with provided fields, with validation
    const updateData: any = {};
    
    if (data.hourlyRate !== undefined) {
      const rateValidation = validateHourlyRate(data.hourlyRate);
      if (!rateValidation.valid) {
        return NextResponse.json(
          { error: rateValidation.error },
          { status: 400 }
        );
      }
      updateData.hourlyRate = rateValidation.value;
    }
    
    if (data.currentTask !== undefined) {
      const taskValidation = validateTextField(data.currentTask, 500, 'Current task', false);
      if (!taskValidation.valid) {
        return NextResponse.json(
          { error: taskValidation.error },
          { status: 400 }
        );
      }
      updateData.currentTask = taskValidation.value || '';
    }
    
    if (data.category !== undefined) {
      const categoryValidation = validateCategory(data.category);
      if (!categoryValidation.valid) {
        return NextResponse.json(
          { error: categoryValidation.error },
          { status: 400 }
        );
      }
      updateData.category = categoryValidation.value;
    }
    
    if (data.timer !== undefined) {
      const timerValidation = validateDuration(data.timer);
      if (!timerValidation.valid) {
        return NextResponse.json(
          { error: timerValidation.error },
          { status: 400 }
        );
      }
      updateData.timer = timerValidation.value;
    }
    
    if (data.timerStartTime !== undefined) {
      if (data.timerStartTime === null) {
        updateData.timerStartTime = null;
      } else {
        const timestampValidation = validateTimestamp(data.timerStartTime);
        if (!timestampValidation.valid) {
          return NextResponse.json(
            { error: timestampValidation.error },
            { status: 400 }
          );
        }
        updateData.timerStartTime = timestampValidation.value;
      }
    }
    
    if (data.showMinerals !== undefined) {
      if (typeof data.showMinerals !== 'boolean') {
        return NextResponse.json(
          { error: 'showMinerals must be a boolean' },
          { status: 400 }
        );
      }
      updateData.showMinerals = data.showMinerals;
    }
    
    if (data.taskHistoryMinimized !== undefined) {
      if (typeof data.taskHistoryMinimized !== 'boolean') {
        return NextResponse.json(
          { error: 'taskHistoryMinimized must be a boolean' },
          { status: 400 }
        );
      }
      updateData.taskHistoryMinimized = data.taskHistoryMinimized;
    }
    
    if (data.openLoopsMinimized !== undefined) {
      if (typeof data.openLoopsMinimized !== 'boolean') {
        return NextResponse.json(
          { error: 'openLoopsMinimized must be a boolean' },
          { status: 400 }
        );
      }
      updateData.openLoopsMinimized = data.openLoopsMinimized;
    }
    
    if (data.goalTarget !== undefined) {
      if (data.goalTarget === null) {
        updateData.goalTarget = null;
      } else {
        const goalValidation = validateMoneyAmount(data.goalTarget);
        if (!goalValidation.valid) {
          return NextResponse.json(
            { error: goalValidation.error },
            { status: 400 }
          );
        }
        updateData.goalTarget = goalValidation.value;
      }
    }
    
    if (data.goalMotivation !== undefined) {
      const motivationValidation = validateGoalMotivation(data.goalMotivation);
      if (!motivationValidation.valid) {
        return NextResponse.json(
          { error: motivationValidation.error },
          { status: 400 }
        );
      }
      updateData.goalMotivation = motivationValidation.value;
    }
    
    if (data.goalCreatedAt !== undefined) {
      if (data.goalCreatedAt === null) {
        updateData.goalCreatedAt = null;
      } else {
        const timestampValidation = validateTimestamp(data.goalCreatedAt);
        if (!timestampValidation.valid) {
          return NextResponse.json(
            { error: timestampValidation.error },
            { status: 400 }
          );
        }
        updateData.goalCreatedAt = timestampValidation.value;
      }
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
        goalTarget: (data as any).goalTarget ?? null,
        goalMotivation: (data as any).goalMotivation ?? null,
        goalCreatedAt: (data as any).goalCreatedAt ? BigInt((data as any).goalCreatedAt) : null,
      } as any,
    });

    // Convert BigInt to string for JSON serialization
    const userDataResponse = {
      ...userData,
      timerStartTime: userData.timerStartTime ? userData.timerStartTime.toString() : null,
      goalCreatedAt: (userData as any).goalCreatedAt ? (userData as any).goalCreatedAt.toString() : null,
    };
    
    return NextResponse.json(userDataResponse);
  } catch (error) {
    console.error('Error saving data:', error);
    
    // Don't expose internal errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}

