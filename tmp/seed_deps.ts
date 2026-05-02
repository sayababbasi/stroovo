import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding task dependencies...');
    
    // Find some tasks
    const tasks = await prisma.task.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    
    if (tasks.length < 2) {
        console.log('Not enough tasks to create dependencies.');
        return;
    }
    
    // Create some dependencies
    // Task 0 depends on Task 1
    // Task 2 depends on Task 0
    
    try {
        await prisma.task.update({
            where: { id: tasks[0].id },
            data: {
                taskDependencies: {
                    connect: [{ id: tasks[1].id }]
                }
            }
        });
        
        await prisma.task.update({
            where: { id: tasks[2].id },
            data: {
                taskDependencies: {
                    connect: [{ id: tasks[0].id }]
                }
            }
        });
        
        console.log(`Success! ${tasks[0].title} now depends on ${tasks[1].title}`);
        console.log(`Success! ${tasks[2].title} now depends on ${tasks[0].title}`);
    } catch (e) {
        console.error('Error seeding dependencies:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
