import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiPost } from '@/lib/api';

export default function AdminCreatePolicyModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [effect, setEffect] = useState('ALLOW');
    const [appliesToAll, setAppliesToAll] = useState(false);
    const [resources, setResources] = useState<string[]>(['*']);
    const [mfaRequired, setMfaRequired] = useState('OPTIONAL');
    const [readOnly, setReadOnly] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await apiPost('/api/admin/access-policies', null, {
                name,
                description,
                effect,
                appliesToAll,
                resources,
                mfaRequired,
                readOnly,
                status: 'ACTIVE'
            });

            if (res.success) {
                toast.success('Access Policy Created');
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || 'Failed to create policy');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(9, 30, 66, 0.54)' }} onClick={onClose} />
            <div style={{ position: 'relative', background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 16px rgba(9,30,66,0.1)' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>Create Access Policy</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>
                
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {step === 1 && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>Policy Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '4px', border: '2px solid #DFE1E6', outline: 'none' }} placeholder="e.g. Enforce MFA for Billing" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '4px', border: '2px solid #DFE1E6', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>Policy Effect</label>
                                <select value={effect} onChange={e => setEffect(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '4px', border: '2px solid #DFE1E6', outline: 'none' }}>
                                    <option value="ALLOW">ALLOW - Grants access if conditions are met</option>
                                    <option value="DENY">DENY - Explicitly blocks access if conditions are met</option>
                                </select>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>Scope - Who does this apply to?</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={appliesToAll} onChange={e => setAppliesToAll(e.target.checked)} />
                                    <span style={{ fontSize: '14px', color: '#172B4D' }}>Apply to all members in the organization</span>
                                </label>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>Resources - What does this govern?</label>
                                <input value={resources.join(', ')} onChange={e => setResources(e.target.value.split(',').map(s=>s.trim()))} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '4px', border: '2px solid #DFE1E6', outline: 'none' }} placeholder="* for all, or 'users', 'billing'" />
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>MFA Requirement</label>
                                <select value={mfaRequired} onChange={e => setMfaRequired(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '4px', border: '2px solid #DFE1E6', outline: 'none' }}>
                                    <option value="OPTIONAL">Optional - Respect user settings</option>
                                    <option value="REQUIRED">Required - Must have MFA enabled to access</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={readOnly} onChange={e => setReadOnly(e.target.checked)} />
                                    <span style={{ fontSize: '14px', color: '#172B4D', fontWeight: 600 }}>Enforce Read-Only Access</span>
                                </label>
                                <p style={{ margin: '4px 0 0 24px', fontSize: '12px', color: '#6B778C' }}>If checked, subjects will only be able to perform 'view' or 'read' actions, regardless of their role permissions.</p>
                            </div>
                        </>
                    )}
                </div>

                <div style={{ padding: '24px', borderTop: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} style={{ height: '40px', padding: '0 20px', borderRadius: '4px', border: 'none', background: 'transparent', color: '#42526E', fontWeight: 600, cursor: 'pointer' }}>
                        {step > 1 ? 'Back' : 'Cancel'}
                    </button>
                    <button 
                        disabled={loading || (step === 1 && !name)}
                        onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                        style={{ height: '40px', padding: '0 20px', borderRadius: '4px', border: 'none', background: '#0052CC', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: (loading || (step === 1 && !name)) ? 0.7 : 1 }}
                    >
                        {loading ? 'Saving...' : step < 3 ? 'Next' : 'Create Policy'}
                    </button>
                </div>
            </div>
        </div>
    );
}
