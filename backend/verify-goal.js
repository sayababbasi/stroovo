// Native fetch is available in Node 18+
// If node-fetch isn't available, we'll use standard http/https or just rely on native fetch if node version > 18.
// Since we used fetch in previous scripts, assuming native fetch is available.

const API_URL = 'http://localhost:5001';

async function verifyGoalCreation() {
    try {
        console.log('1. Fetching Users...');
        const usersRes = await fetch(`${API_URL}/api/users`);
        if (!usersRes.ok) throw new Error(`Failed to fetch users: ${usersRes.statusText}`);
        const users = await usersRes.json();

        const owner = users[0];
        if (!owner) throw new Error('No users found to set as owner.');
        console.log(`   Selected Owner: ${owner.name} (${owner.id})`);

        console.log('2. Fetching Cycles...');
        const cyclesRes = await fetch(`${API_URL}/api/cycles`);
        const cycles = await cyclesRes.json();
        const cycle = Array.isArray(cycles) && cycles.length > 0 ? cycles[0] : null;
        console.log(`   Selected Cycle: ${cycle ? cycle.name : 'None (null)'}`);

        console.log('3. Creating Goal...');
        const payload = {
            title: "API Verification Goal",
            description: "Created via backend verification script",

            status: "ON_TRACK",
            ownerId: owner.id,
            cycleId: cycle ? cycle.id : null,
            keyResults: [
                { title: "Verify Backend", targetValue: 100, unit: "PERCENTAGE", initialValue: 0, currentValue: 100 }
            ]
        };

        const createRes = await fetch(`${API_URL}/api/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!createRes.ok) {
            const err = await createRes.json();
            throw new Error(`Create Failed: ${JSON.stringify(err)}`);
        }

        const newGoal = await createRes.json();
        console.log('SUCCESS: Goal Created!');
        console.log('Goal ID:', newGoal.id);
        console.log('Goal Title:', newGoal.title);

    } catch (error) {
        console.error('VERIFICATION FAILED:', error.message);
        process.exit(1);
    }
}

verifyGoalCreation();
