const payload = {
    name: 'Q1 2026',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    status: 'ACTIVE'
};

fetch('http://localhost:5001/api/cycles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
    .then(res => res.json())
    .then(data => console.log('Cycle created:', data))
    .catch(err => console.error(err));
