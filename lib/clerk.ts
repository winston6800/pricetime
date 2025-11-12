import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './db';

/**
 * Get the current authenticated user from Clerk and sync with database
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  // Sync user with database
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: clerkUser.firstName && clerkUser.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.username || null,
    },
    create: {
      id: userId,
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: clerkUser.firstName && clerkUser.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.username || null,
    },
  });

  return user;
}

/**
 * Require authentication - throws if user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

