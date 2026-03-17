const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // Create an Admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@workflow.com' },
        update: {},
        create: {
            email: 'admin@workflow.com',
            name: 'Admin User',
            password: 'admin123', // In a real app, hash this!
            role: 'ADMIN',
        },
    });

    const projectManager = await prisma.user.upsert({
        where: { email: 'pm@workflow.com' },
        update: {},
        create: {
            email: 'pm@workflow.com',
            name: 'Project Manager',
            password: 'pm123',
            role: 'PROJECT_MANAGER',
        },
    });

    // Create a Project
    const project = await prisma.project.create({
        data: {
            name: 'Website Redesign',
            description: 'Modernizing the company landing page and blog.',
            managerId: projectManager.id,
            tasks: {
                create: [
                    {
                        title: 'Design Homepage Mockups',
                        description: 'Create 3 high-fidelity variations for the home page.',
                        status: 'TODO',
                        priority: 'HIGH',
                    },
                    {
                        title: 'Setup Git Repository',
                        description: 'Initialize repo and configure CI/CD.',
                        status: 'IN_PROGRESS',
                        priority: 'MEDIUM',
                    },
                    {
                        title: 'Write Announcement Blog Post',
                        description: 'Draft the post for next week release.',
                        status: 'TODO',
                        priority: 'LOW',
                    }
                ],
            },
        },
    });

    console.log({ admin, projectManager, project });
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
