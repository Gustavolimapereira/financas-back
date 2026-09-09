import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminName = process.env.ADMIN_NAME;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminName || !adminEmail || !adminPassword) {
    console.log('Seed skipped because admin credentials were not provided');
    return;
  }

  const normalizedEmail = adminEmail.toLowerCase();
  const passwordHash = await argon2.hash(adminPassword);

  await prisma.user.upsert({
    where: { email: normalizedEmail },
    create: {
      name: adminName,
      email: normalizedEmail,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
    update: {
      name: adminName,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('Admin user synchronized');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
