import { PrismaClient, $Enums } from '@prisma/client';  // Import PrismaClient and Prisma enums
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  // Seed users
  const users = [
    {
      email: 'john.doe@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '123-456-7890',
      progress: 85.0,
      role: $Enums.Role.admin  // Use Prisma enum for role
    },
    {
      email: 'jane.smith@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '987-654-3210',
      progress: 92.5,
      role: $Enums.Role.student  // Use Prisma enum for role
    },
    {
      email: 'alex.jones@example.com',
      password: 'password123',
      firstName: 'Alex',
      lastName: 'Jones',
      phoneNumber: '555-555-5555',
      progress: 75.0,
      role: $Enums.Role.student  // Use Prisma enum for role
    },
  ];

  for (const user of users) {
    // Hash the password before inserting/updating into the database
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    // Upsert user in the database
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName || null, // Ensure null is used instead of undefined
        lastName: user.lastName || null,   // Ensure null is used instead of undefined
        phoneNumber: user.phoneNumber || null, // Ensure null is used instead of undefined
        progress: user.progress,
        password: hashedPassword,
        role: user.role,  // Assign Prisma enum for role
      },
      create: {
        email: user.email,
        password: hashedPassword, // Set hashed password
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        progress: user.progress,
        role: user.role,  // Assign Prisma enum for role
      },
    });
  }

  console.log('Seed data upserted with hashed passwords');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
