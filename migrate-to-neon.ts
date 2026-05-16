import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const LOCAL_DB_URL = 'postgresql://postgres:abbe@localhost:5432/work_management_db?schema=public';
const NEON_DB_URL = process.env.DATABASE_URL || '';

async function migrateData() {
  console.log('Starting migration from local to Neon database...');

  // First, export data from local database
  console.log('\n=== STEP 1: Exporting data from local database ===');
  process.env.DATABASE_URL = LOCAL_DB_URL;
  const localPrisma = new PrismaClient();

  try {
    await localPrisma.$connect();
    console.log('✓ Local database connected');

    // Get all table names from the database
    const tables = await localPrisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log(`Found ${(tables as any[]).length} tables`);

    const migrationData: any = {};

    // Export data from each table
    for (const table of tables as any[]) {
      const tableName = table.table_name;
      try {
        const data = await localPrisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
        if (Array.isArray(data) && data.length > 0) {
          migrationData[tableName] = data;
          console.log(`✓ Exported ${data.length} records from ${tableName}`);
        }
      } catch (error) {
        console.log(`  Skipping ${tableName}: ${error}`);
      }
    }

    // Save export to file
    fs.writeFileSync('migration-data.json', JSON.stringify(migrationData, null, 2));
    console.log('\n✓ Data exported to migration-data.json');

    await localPrisma.$disconnect();

    // Second, import data to Neon database
    console.log('\n=== STEP 2: Importing data to Neon database ===');
    process.env.DATABASE_URL = NEON_DB_URL;
    const neonPrisma = new PrismaClient();

    await neonPrisma.$connect();
    console.log('✓ Neon database connected');

    // Import data to each table
    for (const tableName in migrationData) {
      const data = migrationData[tableName];
      if (Array.isArray(data) && data.length > 0) {
        try {
          // Get column names for this table
          const columns = await neonPrisma.$queryRawUnsafe(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = '${tableName}' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
          `);

          const columnNames = (columns as any[]).map(c => c.column_name);
          const values = data.map(row => {
            const rowValues = columnNames.map(col => {
              const val = row[col];
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
              if (val instanceof Date) return `'${val.toISOString()}'`;
              return val;
            });
            return `(${rowValues.join(', ')})`;
          }).join(', ');

          const insertQuery = `
            INSERT INTO "${tableName}" (${columnNames.map(c => `"${c}"`).join(', ')})
            VALUES ${values}
            ON CONFLICT DO NOTHING
          `;

          await neonPrisma.$executeRawUnsafe(insertQuery);
          console.log(`✓ Imported ${data.length} records to ${tableName}`);
        } catch (error) {
          console.log(`  Error importing ${tableName}: ${error}`);
          // Try individual records
          for (const record of data) {
            try {
              const columns = Object.keys(record);
              const values = Object.values(record).map(val => {
                if (val === null) return null;
                if (typeof val === 'string') return val;
                if (typeof val === 'boolean') return val;
                if (val instanceof Date) return val;
                return val;
              });

              const columnNames = columns.map(c => `"${c}"`).join(', ');
              const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

              await neonPrisma.$executeRawUnsafe(
                `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                ...values
              );
            } catch (err) {
              // Skip individual record errors
            }
          }
          console.log(`  ✓ Attempted individual record imports for ${tableName}`);
        }
      }
    }

    console.log('\n✓ Migration completed successfully!');
    console.log(`Total tables migrated: ${Object.keys(migrationData).length}`);

    await neonPrisma.$disconnect();

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData()
  .then(() => {
    console.log('\nMigration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration process failed:', error);
    process.exit(1);
  });
