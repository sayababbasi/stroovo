import prisma from '../src/lib/prisma';

async function main() {
  console.log('Seeding initial departments...');

  const users = await prisma.user.findMany();
  const sayab = users.find(u => u.email.includes('sayab')) || users[0];
  const asad = users.find(u => u.email.includes('sales')) || users[0];
  const hasaan = users.find(u => u.email.includes('cofounder')) || users[0];

  const defaultDepts = [
    {
      name: 'Engineering & Technology',
      code: 'ENG',
      description: 'Software development, infrastructure, AI systems, and platform security.',
      budget: 150000,
      status: 'ACTIVE',
      headId: hasaan?.id,
      memberIds: users.filter(u => u.email.includes('cofounder') || u.email.includes('management')).map(u => u.id)
    },
    {
      name: 'Sales & Growth',
      code: 'SALES',
      description: 'Enterprise sales, client relations, revenue growth, and strategic partnerships.',
      budget: 85000,
      status: 'ACTIVE',
      headId: asad?.id,
      memberIds: users.filter(u => u.email.includes('sales')).map(u => u.id)
    },
    {
      name: 'Executive Management',
      code: 'EXEC',
      description: 'Strategic direction, organizational operations, and corporate governance.',
      budget: 200000,
      status: 'ACTIVE',
      headId: sayab?.id,
      memberIds: users.filter(u => u.email.includes('founder') || u.email.includes('sayababbasi')).map(u => u.id)
    },
    {
      name: 'Human Resources & People Ops',
      code: 'HR',
      description: 'Talent acquisition, team culture, performance management, and employee relations.',
      budget: 45000,
      status: 'ACTIVE',
      headId: null,
      memberIds: []
    }
  ];

  for (const dept of defaultDepts) {
    const existing = await (prisma as any).department.findUnique({ where: { name: dept.name } });
    if (!existing) {
      const created = await (prisma as any).department.create({
        data: {
          name: dept.name,
          code: dept.code,
          description: dept.description,
          budget: dept.budget,
          status: dept.status,
          headId: dept.headId,
          members: dept.memberIds.length > 0 ? {
            connect: dept.memberIds.map(id => ({ id }))
          } : undefined
        }
      });
      console.log(`Created department: ${created.name}`);

      if (dept.memberIds.length > 0) {
        await (prisma as any).user.updateMany({
          where: { id: { in: dept.memberIds } },
          data: { department: created.name }
        });
      }
    }
  }

  console.log('Department seeding completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
