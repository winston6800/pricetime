import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/clerk';
import { prisma } from '@/lib/db';

/**
 * POST /api/tasks - Finish a task (add to history)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { name, category, cost, duration, valueEarned } = await request.json();

    const task = await prisma.taskHistory.create({
      data: {
        userId: user.id,
        name: name || 'Untitled',
        category: category || 'rock',
        cost: cost || '0.00',
        timestamp: BigInt(Date.now()),
        duration: duration || 0,
        valueEarned: valueEarned || 0,
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
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tasks - Get user's task history
 */
export async function GET() {
  try {
    const user = await requireAuth();
    
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
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks - Update a task's valueEarned
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { taskId, valueEarned } = await request.json();

    if (!taskId) {
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

    const updatedTask = await prisma.taskHistory.update({
      where: { id: taskId },
      data: { valueEarned: valueEarned || 0 },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
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
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
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
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

