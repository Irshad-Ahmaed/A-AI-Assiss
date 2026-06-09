import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from './prisma';

async function seed() {
  console.log("Seeding database...");
  try {
    const adminEmail = 'admin@samayak.com';
    const adminPassword = 'password123';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      console.log("Admin user already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await prisma.user.create({
      data: {
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
