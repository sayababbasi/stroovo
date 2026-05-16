import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/authorization';

export async function POST(request: Request) {
    const authResult = await requirePermission('automations.create')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // --- AI Logic (Simulated for high-fidelity demonstration) ---
        // In a real scenario, this would call Ollama or another LLM with a specialized system prompt
        // to return a valid JSON structure for nodes and edges.

        const promptLower = prompt.toLowerCase();
        
        let nodes: any[] = [];
        let edges: any[] = [];

        // Simple mapping logic for demonstration
        if (promptLower.includes('sprint') || promptLower.includes('risk')) {
            nodes = [
                { id: '1', type: 'trigger', subType: 'sprint_risk_high', position: { x: 400, y: 50 }, data: { label: 'Sprint Delivery Risk > 70%' } },
                { id: '2', type: 'ai', subType: 'analyze_bottlenecks', position: { x: 400, y: 150 }, data: { label: 'AI: Analyze Bottlenecks' } },
                { id: '3', type: 'logic', subType: 'if_else', position: { x: 400, y: 250 }, data: { label: 'If Critical Blocker Found' } },
                { id: '4', type: 'action', subType: 'notify_channel', position: { x: 250, y: 400 }, data: { label: 'Alert Management Channel' } },
                { id: '5', type: 'action', subType: 'rebalance_tasks', position: { x: 550, y: 400 }, data: { label: 'Autonomous Task Rebalance' } },
            ];
            edges = [
                { id: 'e1-2', source: '1', target: '2', animated: true },
                { id: 'e2-3', source: '2', target: '3', animated: true },
                { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true', label: 'YES' },
                { id: 'e3-5', source: '3', target: '5', sourceHandle: 'false', label: 'NO' },
            ];
        } else if (promptLower.includes('overdue') || promptLower.includes('task')) {
            nodes = [
                { id: '1', type: 'trigger', subType: 'task_overdue', position: { x: 400, y: 50 }, data: { label: 'Task Overdue 24h' } },
                { id: '2', type: 'ai', subType: 'predict_delay', position: { x: 400, y: 150 }, data: { label: 'Predict Project Delay' } },
                { id: '3', type: 'action', subType: 'update_priority', position: { x: 400, y: 300 }, data: { label: 'Set Priority: URGENT' } },
            ];
            edges = [
                { id: 'e1-2', source: '1', target: '2', animated: true },
                { id: 'e2-3', source: '2', target: '3', animated: true },
            ];
        } else {
            // Default generic template
            nodes = [
                { id: '1', type: 'trigger', subType: 'custom_event', position: { x: 400, y: 50 }, data: { label: 'Custom Trigger' } },
                { id: '2', type: 'ai', subType: 'process_data', position: { x: 400, y: 200 }, data: { label: 'AI Process' } },
                { id: '3', type: 'action', subType: 'send_notif', position: { x: 400, y: 350 }, data: { label: 'Send Notification' } },
            ];
            edges = [
                { id: 'e1-2', source: '1', target: '2', animated: true },
                { id: 'e2-3', source: '2', target: '3', animated: true },
            ];
        }

        return NextResponse.json({
            name: `Autonomous ${prompt.substring(0, 20)}...`,
            description: `AI-generated automation based on: "${prompt}"`,
            nodes,
            edges,
            confidenceScore: 0.92
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
