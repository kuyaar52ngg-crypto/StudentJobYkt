import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Attempting to alter table Company...');
    await prisma.$executeRawUnsafe('ALTER TABLE "Company" ALTER COLUMN "logo" TYPE TEXT;');
    console.log('Successfully altered Company logo column to TEXT');
    
    // Also check if any other fields need it
    // await prisma.$executeRawUnsafe('ALTER TABLE "User" ALTER COLUMN "avatarUrl" TYPE TEXT;');
  } catch (error) {
    console.error('Failed to alter table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
