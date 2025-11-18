// Postinstall script to generate Prisma client
// Uses dummy DATABASE_URL if not set (only needed for schema parsing during generation)

const { execSync } = require('child_process');

// Set a dummy DATABASE_URL if not provided (Prisma needs it to parse schema, but won't connect during generate)
const originalDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl = originalDatabaseUrl || 'postgresql://dummy:dummy@localhost:5432/dummy';

if (!originalDatabaseUrl) {
  console.log('⚠️  DATABASE_URL not found in environment, using dummy URL for Prisma generation');
} else {
  console.log('✅ DATABASE_URL found in environment');
}

process.env.DATABASE_URL = databaseUrl;
process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = '1';

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

