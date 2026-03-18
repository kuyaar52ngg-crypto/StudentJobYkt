import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const employers = await prisma.user.findMany({
    where: { role: 'EMPLOYER' },
    include: { company: true },
  });

  console.log('Employers and their logos:');
  employers.forEach(u => {
    console.log(`User: ${u.email}, Name: ${u.name}`);
    console.log(`Company Name: ${u.company?.name}`);
    console.log(`Logo starts with: ${u.company?.logo?.substring(0, 50)}... (length: ${u.company?.logo?.length || 0})`);
    console.log('---');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
