import { PrismaClient, $Enums } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const saltRounds = 10;

    // Define users to be created or updated
    const users = [
        {
            email: 'john.doe@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '123-456-7890',
            totalScore: 0,
            averageScore: 0.0,
            progress: 85.0,
            role: $Enums.Role.admin,
            currentTopicId: 1,
            lastTaskId: 0,
            resetPasswordToken: null,
            startDate: new Date('2024-01-01'),
            status: $Enums.Status.active,
            certificateUrl: ''
        },
        {
            email: 'jane.smith@example.com',
            password: 'password123',
            firstName: 'Jane',
            lastName: 'Smith',
            phoneNumber: '987-654-3210',
            totalScore: 0,
            averageScore: 0.0,
            progress: 92.5,
            role: $Enums.Role.student,
            currentTopicId: 2,
            lastTaskId: 0,
            resetPasswordToken: null,
            startDate: new Date('2024-02-01'),
            status: $Enums.Status.active,
            certificateUrl: ''
        },
        {
            email: 'alex.jones@example.com',
            password: 'password123',
            firstName: 'Alex',
            lastName: 'Jones',
            phoneNumber: '555-555-5555',
            totalScore: 0,
            averageScore: 0.0,
            progress: 75.0,
            role: $Enums.Role.student,
            currentTopicId: 3,
            lastTaskId: 0,
            resetPasswordToken: null,
            startDate: new Date('2024-03-01'),
            status: $Enums.Status.not_started,
            certificateUrl: ''
        },
        {
            id: 111,
            email: 'chidi90simeon@gmail.com',
            password: '$2b$10$TOrR9geIDfCo/6ITlZ/O/uDv7ofTNd5boH42lgitZeyOfRgUV6jW.', // Pre-hashed password
            firstName: 'Chidiebere',
            lastName: 'Nwabekeyi',
            phoneNumber: null,
            totalScore: 0,
            averageScore: 0,
            progress: 0,
            role: $Enums.Role.student,
            currentTopicId: 1,
            lastTaskId: 0,
            resetPasswordToken: null,
            startDate: new Date('2025-03-25'),
            status: $Enums.Status.active,
            certificateUrl: ''
        }
    ];

    // Upsert users to avoid replacing data if already existing
    for (const user of users) {
        const hashedPassword = user.password.includes('$2b$') ? user.password : await bcrypt.hash(user.password, saltRounds);
        const upsertedUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                password: hashedPassword,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                totalScore: user.totalScore,
                averageScore: user.averageScore,
                progress: user.progress,
                role: user.role,
                currentTopicId: user.currentTopicId,
                lastTaskId: user.lastTaskId,
                resetPasswordToken: user.resetPasswordToken,
                startDate: user.startDate,
                status: user.status,
                certificateUrl: user.certificateUrl
            },
            create: {
                email: user.email,
                password: hashedPassword,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                totalScore: user.totalScore,
                averageScore: user.averageScore,
                progress: user.progress,
                role: user.role,
                currentTopicId: user.currentTopicId,
                lastTaskId: user.lastTaskId,
                resetPasswordToken: user.resetPasswordToken,
                startDate: user.startDate,
                status: user.status,
                certificateUrl: user.certificateUrl
            }
        });
        console.log(`Upserted user: ${upsertedUser.email}`);
    }

    console.log('Users upserted with hashed passwords, current topic IDs, last task IDs, start date, and status');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
