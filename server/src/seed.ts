import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from './prisma';

async function seed() {
  console.log("Seeding database...");
  try {
    const adminEmail = 'admin@samayak.com';
    const adminPassword = 'admin123';
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      }
    });

    console.log(`Successfully seeded admin user: ${adminUser.email}`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
