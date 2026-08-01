import React, { useState, useEffect } from 'react';
import { X, Mail, Shield, ShieldAlert, Clock, CheckCircle } from 'lucide-react';
import { apiGet, apiPatch } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Can from '@/components/auth/Can';
import { P } from '@/lib/permissions/registry';

export default function AdminInvitationDetailDrawer({ invitationId, onClose, onRefresh }: { invitationId: string | null, onClose: () => void, onRefresh: () => void }) {
    const [invitation, setInvitation] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (invitationId) {
            setLoading(true);
            apiGet(`/api/admin/invitations/${invitationId}`, null).then(res => {
                if (res.success) setInvitation(res.data);
                else toast.error('Failed to load details');
                setLoading(false);
            });
        }
    }, [invitationId]);

    if (!invitationId) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(9, 30, 66, 0.54)' }} onClick={onClose} />
            <div style={{ position: 'relative', width: '450px', background: 'white', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 16px rgba(9,30,66,0.1)' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#172B4D' }}>Invitation Details</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>
                
                {loading || !invitation ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6B778C' }}>Loading details...</div>
                ) : (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Status Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#42526E', fontSize: '20px', fontWeight: 600 }}>
                                {invitation.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: '#172B4D' }}>{invitation.email}</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: invitation.status === 'PENDING' ? '#FFF0B3' : invitation.status === 'ACCEPTED' ? '#E3FCEF' : '#FFEBE6', color: invitation.status === 'PENDING' ? '#172B4D' : invitation.status === 'ACCEPTED' ? '#006644' : '#DE350B' }}>
                                        {invitation.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Organization */}
                        <div>
                            <h4 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Organization Access</h4>
                            <div style={{ background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6B778C', marginBottom: '4px' }}>Role</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>{invitation.systemRole?.name || 'Member'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6B778C', marginBottom: '4px' }}>Teams</div>
                                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#172B4D' }}>
                                        {invitation.teams?.map((t: any) => t.team.name).join(', ') || 'No Teams'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div>
                            <h4 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Security Requirements</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#172B4D' }}>
                                    {invitation.requireEmailVerification ? <CheckCircle size={16} color="#36B37E" /> : <X size={16} color="#DFE1E6" />}
                                    Email Verification Required
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#172B4D' }}>
                                    {invitation.requireMFA ? <CheckCircle size={16} color="#36B37E" /> : <X size={16} color="#DFE1E6" />}
                                    MFA Required
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#172B4D' }}>
                                    {invitation.requireAdminApproval ? <CheckCircle size={16} color="#36B37E" /> : <X size={16} color="#DFE1E6" />}
                                    Admin Approval Required
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div>
                            <h4 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Timeline</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', background: '#DFE1E6' }} />
                                
                                <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#0052CC', zIndex: 1, marginTop: '2px' }} />
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>Created</div>
                                        <div style={{ fontSize: '12px', color: '#6B778C' }}>{new Date(invitation.createdAt).toLocaleString()} by {invitation.inviter?.name || 'Admin'}</div>
                                    </div>
                                </div>
                                
                                {invitation.lastSentAt && (
                                    <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#36B37E', zIndex: 1, marginTop: '2px' }} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>Sent & {invitation.deliveryStatus}</div>
                                            <div style={{ fontSize: '12px', color: '#6B778C' }}>{new Date(invitation.lastSentAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}
                                
                                {invitation.acceptedAt && (
                                    <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#006644', zIndex: 1, marginTop: '2px' }} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>Accepted</div>
                                            <div style={{ fontSize: '12px', color: '#6B778C' }}>{new Date(invitation.acceptedAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}
                                
                                {invitation.revokedAt && (
                                    <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#DE350B', zIndex: 1, marginTop: '2px' }} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>Revoked</div>
                                            <div style={{ fontSize: '12px', color: '#6B778C' }}>{new Date(invitation.revokedAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
