import React, { useState, useEffect } from 'react';
import { X, Check, Users, Shield, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiPost, apiGet } from '@/lib/api';

export default function AdminInviteMemberModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Data sources
    const [teams, setTeams] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);

    // Form state
    const [emailsInput, setEmailsInput] = useState('');
    const [emails, setEmails] = useState<string[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');
    
    // Settings
    const [expiresInDays, setExpiresInDays] = useState('7');
    const [requireEmailVerification, setRequireEmailVerification] = useState(true);
    const [requireMFA, setRequireMFA] = useState(false);
    const [requireAdminApproval, setRequireAdminApproval] = useState(false);

    // Final result
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        if (isOpen && step === 1) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        const [teamsRes, rolesRes] = await Promise.all([
            apiGet('/api/admin/teams', null),
            apiGet('/api/admin/roles', null)
        ]);
        if (teamsRes.success) setTeams(teamsRes.data);
        if (rolesRes.success) setRoles(rolesRes.data);
    };

    if (!isOpen) return null;

    const handleAddEmails = () => {
        const newEmails = emailsInput.split(',').map(e => e.trim()).filter(e => e && e.includes('@'));
        const unique = Array.from(new Set([...emails, ...newEmails]));
        setEmails(unique);
        setEmailsInput('');
    };

    const removeEmail = (email: string) => {
        setEmails(emails.filter(e => e !== email));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await apiPost('/api/admin/invitations', null, {
                emails,
                roleId: selectedRole,
                teams: selectedTeams,
                expiresInDays,
                requireEmailVerification,
                requireMFA,
                requireAdminApproval
            });

            if (res.success) {
                setResult(res);
                setStep(5); // Success step
                onSuccess();
            } else {
                toast.error(res.error || 'Failed to send invitations');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setEmails([]);
        setEmailsInput('');
        setSelectedTeams([]);
        setSelectedRole('');
        setResult(null);
        onClose();
    };

    const activeRole = roles.find(r => r.id === selectedRole);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(9, 30, 66, 0.54)' }} onClick={resetAndClose} />
            <div style={{ position: 'relative', background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 16px rgba(9,30,66,0.1)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>Invite Members</h2>
                    <button onClick={resetAndClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>
                
                {/* Stepper */}
                {step < 5 && (
                    <div style={{ padding: '16px 24px', background: '#FAFBFC', borderBottom: '1px solid #DFE1E6', display: 'flex', gap: '8px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ flex: 1, height: '4px', background: i <= step ? '#0052CC' : '#DFE1E6', borderRadius: '2px' }} />
                        ))}
                    </div>
                )}

                <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {step === 1 && (
                        <>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#172B4D', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Member Information</h3>
                            <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>Enter the email addresses of the people you want to invite.</p>
                            
                            <div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input 
                                        value={emailsInput} 
                                        onChange={e => setEmailsInput(e.target.value)} 
                                        onKeyDown={e => e.key === 'Enter' && handleAddEmails()}
                                        style={{ flex: 1, height: '40px', padding: '0 12px', borderRadius: '4px', border: '2px solid #DFE1E6', outline: 'none' }} 
                                        placeholder="john@company.com, jane@company.com" 
                                    />
                                    <button onClick={handleAddEmails} style={{ padding: '0 16px', height: '40px', background: '#F4F5F7', border: '1px solid #DFE1E6', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Add</button>
                                </div>
                            </div>

                            {emails.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '16px', background: '#FAFBFC', borderRadius: '6px', border: '1px solid #DFE1E6' }}>
                                    {emails.map(email => (
                                        <div key={email} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '4px 8px', borderRadius: '16px', border: '1px solid #DFE1E6', fontSize: '13px' }}>
                                            {email}
                                            <X size={14} cursor="pointer" onClick={() => removeEmail(email)} color="#6B778C" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#172B4D', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} /> Organization Access</h3>
                            <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>Assign teams and a system role.</p>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>System Role</label>
                                <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '4px', border: '2px solid #DFE1E6', outline: 'none' }}>
                                    <option value="">Select a Role</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>Assign Teams</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {teams.map(team => (
                                        <label key={team.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid #DFE1E6', borderRadius: '6px', cursor: 'pointer', background: selectedTeams.includes(team.id) ? '#E6FCFF' : 'white' }}>
                                            <input type="checkbox" checked={selectedTeams.includes(team.id)} onChange={e => {
                                                if (e.target.checked) setSelectedTeams([...selectedTeams, team.id]);
                                                else setSelectedTeams(selectedTeams.filter(id => id !== team.id));
                                            }} />
                                            <span style={{ fontSize: '14px', fontWeight: 500 }}>{team.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#172B4D' }}>Permissions Preview</h3>
                            <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>Review what the invited users will be able to do.</p>
                            
                            {activeRole ? (
                                <div style={{ background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: '6px', padding: '16px' }}>
                                    <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>Role: {activeRole.name}</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {activeRole.permissions?.map((p: any) => (
                                            <div key={p.permission.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                                <Check size={14} color="#36B37E" /> {p.permission.name}
                                            </div>
                                        )) || <div style={{ fontSize: '13px', color: '#6B778C' }}>No permissions assigned to this role.</div>}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: '#DE350B', fontSize: '14px' }}>Please select a role in the previous step.</div>
                            )}
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#172B4D', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={18} /> Invitation Settings</h3>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>Expiration</label>
                                <select value={expiresInDays} onChange={e => setExpiresInDays(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '4px', border: '2px solid #DFE1E6', outline: 'none' }}>
                                    <option value="1">24 hours</option>
                                    <option value="3">3 days</option>
                                    <option value="7">7 days</option>
                                    <option value="14">14 days</option>
                                    <option value="30">30 days</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={requireEmailVerification} onChange={e => setRequireEmailVerification(e.target.checked)} />
                                    <span style={{ fontSize: '14px', color: '#172B4D' }}>Require Email Verification</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={requireMFA} onChange={e => setRequireMFA(e.target.checked)} />
                                    <span style={{ fontSize: '14px', color: '#172B4D' }}>Require MFA after joining</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={requireAdminApproval} onChange={e => setRequireAdminApproval(e.target.checked)} />
                                    <span style={{ fontSize: '14px', color: '#172B4D' }}>Require Admin Approval before joining</span>
                                </label>
                            </div>
                        </>
                    )}

                    {step === 5 && result && (
                        <div style={{ textAlign: 'left', padding: '24px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E3FCEF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#36B37E' }}>
                                    <Check size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>Invitation Results</h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>Processed {result.data?.length || 0} invitations.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', maxHeight: '200px', overflowY: 'auto', background: '#FAFBFC', padding: '12px', borderRadius: '6px', border: '1px solid #DFE1E6' }}>
                                {result.data?.map((inv: any) => (
                                    <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '4px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#172B4D' }}>{inv.email}</div>
                                        {inv.deliveryStatus === 'DELIVERED' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#36B37E', background: '#E3FCEF', padding: '2px 8px', borderRadius: '12px' }}>
                                                <Check size={12} /> Email Delivered
                                            </div>
                                        ) : inv.deliveryStatus === 'FAILED' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#DE350B', background: '#FFEBE6', padding: '2px 8px', borderRadius: '12px' }} title={inv.failureReason || 'Failed'}>
                                                <X size={12} /> Failed to Send
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#FF991F', background: '#FFFAE6', padding: '2px 8px', borderRadius: '12px' }}>
                                                Queued
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {(!result.data || result.data.length === 0) && (
                                    <div style={{ fontSize: '14px', color: '#DE350B' }}>{result.message}</div>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                <button onClick={resetAndClose} style={{ height: '40px', padding: '0 20px', borderRadius: '4px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                                <button onClick={() => { setStep(1); setEmails([]); setEmailsInput(''); setResult(null); }} style={{ height: '40px', padding: '0 20px', borderRadius: '4px', border: 'none', background: '#0052CC', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Send Another</button>
                            </div>
                        </div>
                    )}
                </div>

                {step < 5 && (
                    <div style={{ padding: '20px 24px', borderTop: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} style={{ height: '40px', padding: '0 20px', borderRadius: '4px', border: 'none', background: 'transparent', color: '#42526E', fontWeight: 600, cursor: 'pointer' }}>
                            {step > 1 ? 'Back' : 'Cancel'}
                        </button>
                        <button 
                            disabled={loading || (step === 1 && emails.length === 0) || (step === 2 && !selectedRole)}
                            onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()}
                            style={{ height: '40px', padding: '0 20px', borderRadius: '4px', border: 'none', background: '#0052CC', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: (loading || (step === 1 && emails.length === 0) || (step === 2 && !selectedRole)) ? 0.7 : 1 }}
                        >
                            {loading ? 'Sending...' : step < 4 ? 'Next' : 'Send Invitations'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
