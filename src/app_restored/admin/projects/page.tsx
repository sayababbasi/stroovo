import ProjectTable from '@/components/ProjectTable';

export default function AdminProjectsPage() {
    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Project Oversight</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Monitor and manage all high-level projects within the organization.</p>
            </div>

            <ProjectTable />
        </div>
    );
}
