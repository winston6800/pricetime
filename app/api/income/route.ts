import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/clerk';
import { prisma } from '@/lib/db';
import { validateMoneyAmount, validateNote } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * POST /api/income - Create a manual income entry
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Rate limiting
    const rateLimitKey = getRateLimitKey(user.id);
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.INCOME_ENTRY);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) } }
      );
    }
    
    const { amount, note } = await request.json();

    // Validate amount
    const amountValidation = validateMoneyAmount(amount);
    if (!amountValidation.valid) {
      return NextResponse.json(
        { error: amountValidation.error },
        { status: 400 }
      );
    }

    if (amountValidation.value! <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate note
    const noteValidation = validateNote(note);
    if (!noteValidation.valid) {
      return NextResponse.json(
        { error: noteValidation.error },
        { status: 400 }
      );
    }

    const entry = await prisma.incomeEntry.create({
      data: {
        userId: user.id,
        amount: amountValidation.value!,
        note: noteValidation.value,
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
    
    // Don't expose internal errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create income entry' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/income - Get user's income entries
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
    
    // Don't expose internal errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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
    const entryId = searchParams.get('id');

    if (!entryId || typeof entryId !== 'string') {
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
    
    // Don't expose internal errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete income entry' },
      { status: 500 }
    );
  }
}

