import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    const email = 'admin@admin.com';
    const password = 'adminpassword';
    const passwordHash = await hash(password, 12);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        role: 'ADMIN',
        name: 'Admin User'
      },
      create: {
        email,
        name: 'Admin User',
        passwordHash,
        role: 'ADMIN'
      }
    });

    return NextResponse.json({ 
      message: 'Admin account provisioned successfully', 
      email: admin.email 
    });
  } catch (error: unknown) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      error: 'Failed to setup admin', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
