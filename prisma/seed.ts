import { PrismaClient } from '@prisma/client';
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
    },
    {
      email: 'jane.smith@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '987-654-3210',
      progress: 92.5,
    },
    {
      email: 'alex.jones@example.com',
      password: 'password123',
      firstName: 'Alex',
      lastName: 'Jones',
      phoneNumber: '555-555-5555',
      progress: 75.0,
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
      },
      create: {
        email: user.email,
        password: hashedPassword, // Set hashed password
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        progress: user.progress,
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
