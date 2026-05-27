import 'dotenv/config';
import { PrismaClient, UserRole } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create Super Admin (CEO Role) if not exists
  const adminUser = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (!adminUser) {
    const salt = await bcrypt.genSalt();
    const superAdminHash = await bcrypt.hash('admin1234', salt);
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin.s@gmail.com',
        username: 'admin',
        password_hash: superAdminHash,
        first_name: 'System',
        last_name: 'Administrator',
        role: UserRole.CEO,
        is_active: true,
      },
    });
    console.log('Admin user seeded:', { superAdmin });
  } else {
    console.log('Admin user already exists. Skipping seed.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
