import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@admin.com'
  const password = 'adminpassword'
  const name = 'Admin User'

  const passwordHash = await hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'ADMIN',
      name
    },
    create: {
      email,
      name,
      passwordHash,
      role: 'ADMIN'
    }
  })

  console.log('Admin created:', admin.email, 'with password:', password)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
