import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  console.log('--- STARTING WIPE AND SEED ---');
  
  // 1. Wipe everything using TRUNCATE CASCADE
  console.log('1. Wiping database...');
  const tableNames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT IN ('_prisma_migrations');`;

  const tables = tableNames
    .map(({ tablename }) => `"${tablename}"`)
    .join(', ');

  try {
    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
      console.log('Database wiped successfully.');
    }
  } catch (error) {
    console.error('Error wiping database:', error);
    process.exit(1);
  }

  // 2. Create default tenant
  console.log('2. Creating default Tenant...');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Revotic AI',
      domain: 'revoticai.com',
    }
  });

  // 3. Create Roles
  console.log('3. Creating Roles...');
  const roleNames = ['CEO', 'CTO', 'Manager', 'Super Admin', 'Admin'];
  const createdRoles: Record<string, any> = {};
  for (const name of roleNames) {
    createdRoles[name] = await prisma.role.create({
      data: { name, description: `${name} role`, isSystem: true }
    });
  }

  // 4. Create Users
  console.log('4. Creating Users...');
  const usersToCreate = [
    {
      name: 'Sayab',
      email: 'founder.revoticai@gmail.com',
      password: 'Founder@ceo#revoticai',
      roleName: 'CEO'
    },
    {
      name: 'Hasaan',
      email: 'cofounder.revoticai@gmail.com',
      password: 'cofounder@hasaan#revoticai',
      roleName: 'CTO'
    },
    {
      name: 'Adas',
      email: 'sales.revoticai@gmail.com',
      password: 'manager@asad#revoticai',
      roleName: 'Manager'
    },
    {
      name: 'Sayab Abbasi',
      email: 'sayababbasi806@gmail.com',
      password: 'Sayab@revoticai#admin',
      roleName: 'Super Admin'
    },
    {
      name: 'admin',
      email: 'management.revoticai@gmail.com',
      password: 'revotic@1#Admin',
      roleName: 'Admin'
    }
  ];

  for (const u of usersToCreate) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const role = createdRoles[u.roleName];

    await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash: hashedPassword,
        tenantId: tenant.id,
        roleId: role.id,
        status: 'ACTIVE',
        isEmailVerified: true
      }
    });

    console.log(`Created user ${u.email} (${u.roleName})`);

    // 5. Send Email
    try {
      const emailHtml = `
        <h2>Welcome to Stroovo!</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Role:</strong> ${u.roleName}</p>
        <p><strong>Login Email:</strong> ${u.email}</p>
        <p><strong>Password:</strong> ${u.password}</p>
        <br/>
        <p>Please log in and change your password immediately.</p>
        <br/>
        <p><a href="https://stroovo.revoticai.com/login">Login to Stroovo</a></p>
      `;
      
      const emailRes = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Stroovo@revoticai.com',
        to: u.email,
        subject: 'Your Stroovo Account Credentials',
        html: emailHtml
      });
      
      if (emailRes.error) {
        console.error(`Failed to send email to ${u.email}:`, emailRes.error);
      } else {
        console.log(`Successfully sent email to ${u.email}`);
      }
    } catch (err) {
      console.error(`Error sending email to ${u.email}:`, err);
    }
  }

  console.log('--- WIPE AND SEED COMPLETE ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
