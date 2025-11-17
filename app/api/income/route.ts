import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/clerk';
import { prisma } from '@/lib/db';

/**
 * POST /api/income - Create a manual income entry
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { amount, note } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const entry = await prisma.incomeEntry.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        note: note || null,
        timestamp: BigInt(Date.now()),
      },
    });

    // Convert BigInt to string for JSON serialization
    const entryResponse = {
      ...entry,
      timestamp: entry.timestamp.toString(),
    };

    return NextResponse.json(entryResponse);
  } catch (error) {
    console.error('Error creating income entry:', error);
    return NextResponse.json(
      { error: 'Failed to create income entry' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/income - Get user's income entries
 */
export async function GET() {
  try {
    const user = await requireAuth();
    
    const entries = await prisma.incomeEntry.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
    });

    // Convert BigInt to string for JSON
    const entriesWithStringTimestamp = entries.map(entry => ({
      ...entry,
      timestamp: entry.timestamp.toString(),
    }));

    return NextResponse.json(entriesWithStringTimestamp);
  } catch (error) {
    console.error('Error fetching income entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income entries' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/income - Delete an income entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID required' },
        { status: 400 }
      );
    }

    // Verify entry belongs to user
    const entry = await prisma.incomeEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.userId !== user.id) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    await prisma.incomeEntry.delete({
      where: { id: entryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting income entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete income entry' },
      { status: 500 }
    );
  }
}

