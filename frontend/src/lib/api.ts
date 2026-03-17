const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function fetchTasks() {
    const res = await fetch(`${API_URL}/api/tasks`);
    return res.json();
}

export async function fetchProjects() {
    const res = await fetch(`${API_URL}/api/projects`);
    return res.json();
}

export async function fetchGoals() {
    const res = await fetch(`${API_URL}/api/goals`);
    return res.json();
}

export async function fetchUsers() {
    const res = await fetch(`${API_URL}/api/users`);
    return res.json();
}

export async function createTask(data: any) {
    const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function createProject(data: any) {
    const res = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export { API_URL };
