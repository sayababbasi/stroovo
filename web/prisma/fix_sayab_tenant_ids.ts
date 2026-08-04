import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Fixing Tenant ID for SAYAB Data ---');

    const sayab = await (prisma as any).user.findUnique({
        where: { email: 'founder.revoticai@gmail.com' }
    });

    if (!sayab || !sayab.tenantId) {
        console.error("SAYAB user or tenantId not found! Aborting.");
        return;
    }

    const tenantId = sayab.tenantId;

    // 1. Update Projects managed by SAYAB
    const updatedProjects = await (prisma as any).project.updateMany({
        where: { managerId: sayab.id },
        data: { tenantId }
    });
    console.log(`Updated ${updatedProjects.count} projects with tenantId: ${tenantId}`);

    // 2. Update Tasks assigned to or created by SAYAB
    const updatedTasks = await (prisma as any).task.updateMany({
        where: {
            OR: [
                { assigneeId: sayab.id },
                { createdBy: sayab.id }
            ]
        },
        data: { tenantId }
    });
    console.log(`Updated ${updatedTasks.count} tasks with tenantId: ${tenantId}`);

    // 3. Update Goals owned by SAYAB
    const updatedGoals = await (prisma as any).goal.updateMany({
        where: { ownerId: sayab.id },
        data: { tenantId }
    });
    console.log(`Updated ${updatedGoals.count} goals with tenantId: ${tenantId}`);

    console.log('--- Tenant ID Fix Complete! ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
