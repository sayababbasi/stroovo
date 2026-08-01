import { RoleService } from '../src/lib/services/RoleService';

async function main() {
    console.log('Seeding RBAC...');
    await RoleService.seedInitialRBAC();
    console.log('Done.');
}

main().catch(console.error);
