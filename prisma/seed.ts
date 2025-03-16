import { PrismaClient, $Enums, User } from '@prisma/client'; // Import User type
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  // Clear existing data from User and CodeQuery tables
  await prisma.codeQuery.deleteMany({});
  console.log('Existing CodeQuery records cleared');

  await prisma.user.deleteMany({});
  console.log('Existing User records cleared');

  // Seed users and capture their IDs
  const users = [
    {
      email: 'john.doe@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '123-456-7890',
      progress: 85.0,
      role: $Enums.Role.admin,
      currentTopicId: 1,
      currentTaskId: 0,
    },
    {
      email: 'jane.smith@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '987-654-3210',
      progress: 92.5,
      role: $Enums.Role.student,
      currentTopicId: 2,
      currentTaskId: 0,
    },
    {
      email: 'alex.jones@example.com',
      password: 'password123',
      firstName: 'Alex',
      lastName: 'Jones',
      phoneNumber: '555-555-5555',
      progress: 75.0,
      role: $Enums.Role.student,
      currentTopicId: 3,
      currentTaskId: 0,
    },
  ];

  const createdUsers: User[] = []; // Explicitly type as User[]
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        progress: user.progress,
        role: user.role,
        currentTopicId: user.currentTopicId,
        currentTaskId: user.currentTaskId,
      },
    });
    createdUsers.push(createdUser);
    console.log(`Created user: ${createdUser.email} with ID: ${createdUser.id}`);
  }

  console.log('Users created with hashed passwords, current topic IDs, and current task IDs');

  // Seed CodeQuery entries linked to users using captured IDs
  const codeQueries = [
    {
      query: 'function add(a, b) { return a + b; }',
      fileContent: null,
      fileNames: [],
      criteria: 'Check for readability and efficiency',
      score: 85,
      hints: 'Use descriptive variable names instead of a, b',
      userId: createdUsers[0].id, // John Doe (admin)
    },
    {
      query: null,
      fileContent: 'HTML Code:\n<div>Hello</div>\n\nCSS Code:\n div { color: blue; }',
      fileNames: ['index.html', 'styles.css'],
      criteria: 'Check for semantic HTML and CSS best practices',
      score: 90,
      hints: 'Add semantic tags like <main> or <section>',
      userId: createdUsers[1].id, // Jane Smith (student)
    },
    {
      query: 'let x = 10; console.log(x);',
      fileContent: null,
      fileNames: [],
      criteria: 'Check for variable naming and console usage',
      score: 70,
      hints: 'Use const instead of let for constants',
      userId: createdUsers[2].id, // Alex Jones (student)
    },
  ];

  // Create CodeQuery entries
  for (const codeQuery of codeQueries) {
    await prisma.codeQuery.create({
      data: {
        query: codeQuery.query,
        fileContent: codeQuery.fileContent,
        fileNames: codeQuery.fileNames,
        criteria: codeQuery.criteria,
        score: codeQuery.score,
        hints: codeQuery.hints,
        userId: codeQuery.userId,
      },
    });
    console.log(`Created CodeQuery for userId: ${codeQuery.userId}`);
  }

  console.log('CodeQuery entries created and linked to users');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });