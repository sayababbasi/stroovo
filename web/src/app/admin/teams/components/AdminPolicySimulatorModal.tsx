import React, { useState } from 'react';
import { X, Play, ShieldAlert, ShieldCheck } from 'lucide-react';
import { apiPost } from '@/lib/api';

export default function AdminPolicySimulatorModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [userId, setUserId] = useState('');
    const [resource, setResource] = useState('');
    const [action, setAction] = useState('view');
    const [ip, setIp] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    if (!isOpen) return null;

    const handleSimulate = async () => {
        setLoading(true);
        try {
            const res = await apiPost('/api/admin/access-policies/simulate', null, {
                userId,
                resource,
                action,
                context: { ip }
            });
            if (res.success) setResult(res.data);
            else alert(res.error || 'Simulation failed');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(9, 30, 66, 0.54)' }} onClick={onClose} />
            <div style={{ position: 'relative', background: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 8px 16px rgba(9,30,66,0.1)' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#172B4D' }}>Access Simulator</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>
                
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>Target User ID</label>
                        <input value={userId} onChange={e => setUserId(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '4px', border: '2px solid #DFE1E6', outline: 'none' }} placeholder="User ID" />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>Resource</label>
                            <input value={resource} onChange={e => setResource(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '4px', border: '2px solid #DFE1E6', outline: 'none' }} placeholder="e.g. projects" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>Action</label>
                            <input value={action} onChange={e => setAction(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '4px', border: '2px solid #DFE1E6', outline: 'none' }} placeholder="e.g. create" />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>Simulated IP Address</label>
                        <input value={ip} onChange={e => setIp(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '4px', border: '2px solid #DFE1E6', outline: 'none' }} placeholder="192.168.1.1" />
                    </div>

                    <button 
                        onClick={handleSimulate}
                        disabled={loading || !userId || !resource || !action}
                        style={{ width: '100%', height: '40px', borderRadius: '4px', border: 'none', background: '#0052CC', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: (loading || !userId || !resource || !action) ? 0.7 : 1, marginTop: '8px' }}
                    >
                        <Play size={16} /> {loading ? 'Running...' : 'Run Simulation'}
                    </button>

                    {result && (
                        <div style={{ marginTop: '16px', padding: '16px', borderRadius: '8px', background: result.granted ? '#E3FCEF' : '#FFEBE6', border: `1px solid ${result.granted ? '#36B37E' : '#FF5630'}`, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            {result.granted ? <ShieldCheck size={24} color="#006644" /> : <ShieldAlert size={24} color="#DE350B" />}
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: result.granted ? '#006644' : '#DE350B', marginBottom: '4px' }}>
                                    {result.granted ? 'Access Granted' : 'Access Denied'}
                                </div>
                                <div style={{ fontSize: '13px', color: '#172B4D' }}>{result.reason}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
