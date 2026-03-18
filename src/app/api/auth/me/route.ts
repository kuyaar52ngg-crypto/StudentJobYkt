import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userData = getUserFromRequest(req);

    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userData.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        gender: true,
        birthday: true,
        university: true,
        major: true,
        yearOfStudy: true,
        skills: true,
        interests: true,
        resumeUrl: true,
        avatarUrl: true,
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            industry: true,
            contactInfo: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userData = getUserFromRequest(req);

    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Build user update data
    const userUpdateData: Record<string, unknown> = {};
    const allowedUserFields = ['name', 'phone', 'gender', 'university', 'major', 'yearOfStudy', 'skills', 'interests', 'avatarUrl'];

    for (const field of allowedUserFields) {
      if (body[field] !== undefined) {
        if (field === 'yearOfStudy') {
          userUpdateData[field] = body[field] ? parseInt(body[field]) : null;
        } else {
          userUpdateData[field] = body[field] || null;
        }
      }
    }

    // Handle birthday separately (convert string to Date)
    if (body.birthday !== undefined) {
      userUpdateData.birthday = body.birthday ? new Date(body.birthday) : null;
    }

    const user = await prisma.user.update({
      where: { id: userData.userId },
      data: userUpdateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        gender: true,
        birthday: true,
        university: true,
        major: true,
        yearOfStudy: true,
        skills: true,
        interests: true,
        avatarUrl: true,
      },
    });

    // If employer, also update company fields
    if (userData.role === 'EMPLOYER' && body.company) {
      const companyData: Record<string, unknown> = {};
      const allowedCompanyFields = ['name', 'description', 'industry', 'contactInfo', 'logo'];
      for (const field of allowedCompanyFields) {
        if (body.company[field] !== undefined) {
          companyData[field] = body.company[field] || null;
        }
      }

      if (Object.keys(companyData).length > 0) {
        await prisma.company.upsert({
          where: { userId: userData.userId },
          update: companyData,
          create: {
            ...companyData,
            name: (companyData.name as string) || user.name || 'Компания',
            userId: userData.userId,
          },
        });
      }
    }

    // Fetch the updated user with company data
    const updatedUser = await prisma.user.findUnique({
      where: { id: userData.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        gender: true,
        birthday: true,
        university: true,
        major: true,
        yearOfStudy: true,
        skills: true,
        interests: true,
        avatarUrl: true,
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            industry: true,
            contactInfo: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Me PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
