import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/clerk';
import { getSubscriptionStatus } from '@/lib/subscription';

export async function GET() {
  try {
    const user = await requireAuth();
    const status = await getSubscriptionStatus(user.id);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}

