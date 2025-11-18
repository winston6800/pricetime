import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/clerk';
import { prisma } from '@/lib/db';
import { validateTaskName, validateCategory, validateDuration, validateMoneyAmount } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * POST /api/tasks - Finish a task (add to history)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Rate limiting
    const rateLimitKey = getRateLimitKey(user.id);
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.TASK_CREATE);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) } }
      );
    }
    
    const body = await request.json();
    const { name, category, cost, duration, valueEarned } = body;

    // Validate inputs
    const nameValidation = validateTaskName(name);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    const categoryValidation = validateCategory(category);
    if (!categoryValidation.valid) {
      return NextResponse.json(
        { error: categoryValidation.error },
        { status: 400 }
      );
    }

    const durationValidation = validateDuration(duration);
    if (!durationValidation.valid) {
      return NextResponse.json(
        { error: durationValidation.error },
        { status: 400 }
      );
    }

    const valueEarnedValidation = validateMoneyAmount(valueEarned);
    if (!valueEarnedValidation.valid) {
      return NextResponse.json(
        { error: valueEarnedValidation.error },
        { status: 400 }
      );
    }

    // Validate cost (if provided)
    let costValue = '0.00';
    if (cost !== undefined && cost !== null) {
      const costValidation = validateMoneyAmount(cost);
      if (!costValidation.valid) {
        return NextResponse.json(
          { error: costValidation.error },
          { status: 400 }
        );
      }
      costValue = costValidation.value!.toFixed(2);
    }

    const task = await prisma.taskHistory.create({
      data: {
        userId: user.id,
        name: nameValidation.value || 'Untitled',
        category: categoryValidation.value!,
        cost: costValue,
        timestamp: BigInt(Date.now()),
        duration: durationValidation.value!,
        valueEarned: valueEarnedValidation.value || 0,
      },
    });

    // Convert BigInt to string for JSON serialization
    const taskResponse = {
      ...task,
      timestamp: task.timestamp.toString(),
    };

    return NextResponse.json(taskResponse);
  } catch (error) {
    console.error('Error creating task:', error);
    
    // Don't expose internal errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tasks - Get user's task history
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
    
    const tasks = await prisma.taskHistory.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
    });

    // Convert BigInt to string for JSON
    const tasksWithStringTimestamp = tasks.map(task => ({
      ...task,
      timestamp: task.timestamp.toString(),
    }));

    return NextResponse.json(tasksWithStringTimestamp);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    
    // Don't expose internal errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks - Update a task's valueEarned or category
 */
export async function PATCH(request: NextRequest) {
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
    
    const { taskId, valueEarned, category } = await request.json();

    if (!taskId || typeof taskId !== 'string') {
      return NextResponse.json(
        { error: 'Task ID required' },
        { status: 400 }
      );
    }

    // Verify task belongs to user
    const task = await prisma.taskHistory.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== user.id) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    
    if (valueEarned !== undefined) {
      const valueValidation = validateMoneyAmount(valueEarned);
      if (!valueValidation.valid) {
        return NextResponse.json(
          { error: valueValidation.error },
          { status: 400 }
        );
      }
      updateData.valueEarned = valueValidation.value || 0;
    }
    
    if (category !== undefined) {
      const categoryValidation = validateCategory(category);
      if (!categoryValidation.valid) {
        return NextResponse.json(
          { error: categoryValidation.error },
          { status: 400 }
        );
      }
      updateData.category = categoryValidation.value;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.taskHistory.update({
      where: { id: taskId },
      data: updateData,
    });

    return NextResponse.json({
      ...updatedTask,
      timestamp: updatedTask.timestamp.toString(),
    });
  } catch (error) {
    console.error('Error updating task:', error);
    
    // Don't expose internal errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks - Delete a task
 */
export async function DELETE(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId || typeof taskId !== 'string') {
      return NextResponse.json(
        { error: 'Task ID required' },
        { status: 400 }
      );
    }

    // Verify task belongs to user
    const task = await prisma.taskHistory.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== user.id) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    await prisma.taskHistory.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    
    // Don't expose internal errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

