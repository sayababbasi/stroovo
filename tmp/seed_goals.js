const axios = require('axios');

const ownerId = 'cmjw896sy0001pwuskjza42ln';
const backendUrl = 'http://localhost:5001/api/goals';

const goals = [
    {
        title: 'Increase MRR',
        description: 'Monthly Recurring Revenue',
        status: 'ON TRACK',
        targetDate: '2026-09-30',
        ownerId,
        keyResults: [
            { title: 'Launch new premium plan', currentValue: 4, targetValue: 5 },
            { title: 'Reach $50k MRR', currentValue: 27500, targetValue: 50000 }
        ]
    },
    {
        title: 'Enhance Team Productivity',
        description: 'Internal Efficiency',
        status: 'ON TRACK',
        targetDate: '2026-06-30',
        ownerId,
        keyResults: [
            { title: 'Implement weekly sprint reviews', currentValue: 5, targetValue: 5 },
            { title: 'Automate reporting process', currentValue: 40, targetValue: 100 }
        ]
    }
];

async function seed() {
    for (const goal of goals) {
        try {
            const res = await axios.post(backendUrl, goal);
            console.log('Created goal:', res.data.title);
        } catch (err) {
            console.error('Error creating goal:', err.response?.data || err.message);
        }
    }
}

seed();
