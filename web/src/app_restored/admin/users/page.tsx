import UserTable from '@/components/UserTable';

export default function AdminUsersPage() {
    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>User Management</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Manage team members, roles, and access permissions.</p>
            </div>

            <UserTable />
        </div>
    );
}
