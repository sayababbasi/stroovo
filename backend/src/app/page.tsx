export default function BackendPage() {
    return (
        <main style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Work Platform Backend API</h1>
            <p>This is the API server. Available endpoints:</p>
            <ul>
                <li><code>GET /api/health</code> - Health check</li>
                <li><code>GET /api/users</code> - List all users</li>
                <li><code>GET /api/tasks</code> - List all tasks</li>
                <li><code>GET /api/projects</code> - List all projects</li>
                <li><code>GET /api/goals</code> - List all goals</li>
            </ul>
        </main>
    );
}
