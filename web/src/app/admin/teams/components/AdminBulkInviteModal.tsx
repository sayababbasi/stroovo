import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiPost, apiGet } from '@/lib/api';

export default function AdminBulkInviteModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [stats, setStats] = useState({ valid: 0, invalid: 0, duplicate: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [roles, setRoles] = useState<any[]>([]);
    
    useEffect(() => {
        if (isOpen) {
            apiGet('/api/admin/roles', null).then(res => {
                if (res.success) setRoles(res.data);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const parseCSV = (text: string) => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) return toast.error('CSV appears to be empty or missing headers');
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const emailIdx = headers.indexOf('email');
        const roleIdx = headers.indexOf('role');
        
        if (emailIdx === -1) return toast.error('CSV must contain an "email" column');

        const seenEmails = new Set();
        const data = [];
        let valid = 0; let invalid = 0; let duplicate = 0;

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const email = values[emailIdx];
            const roleName = roleIdx !== -1 ? values[roleIdx] : null;
            
            if (!email || !email.includes('@')) {
                invalid++;
                continue;
            }
            if (seenEmails.has(email)) {
                duplicate++;
                continue;
            }
            seenEmails.add(email);

            let roleId = null;
            if (roleName) {
                const foundRole = roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
                if (foundRole) roleId = foundRole.id;
            }

            data.push({ email, roleId, teams: [] });
            valid++;
        }

        setStats({ valid, invalid, duplicate });
        setParsedData(data);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            parseCSV(text);
        };
        reader.readAsText(file);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await apiPost('/api/admin/invitations/bulk', null, {
                invitations: parsedData
            });

            if (res.success) {
                toast.success(res.message || 'Bulk invitations sent successfully.');
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || 'Bulk invitation failed');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setParsedData([]);
        setStats({ valid: 0, invalid: 0, duplicate: 0 });
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    const downloadTemplate = () => {
        const content = "first_name,last_name,email,team,role\nJohn,Doe,john@example.com,,Employee\nJane,Smith,jane@example.com,,Manager\n";
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "invitation_template.csv";
        a.click();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(9, 30, 66, 0.54)' }} onClick={resetAndClose} />
            <div style={{ position: 'relative', background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 16px rgba(9,30,66,0.1)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>Bulk Invite</h2>
                    <button onClick={resetAndClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>
                
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {parsedData.length === 0 ? (
                        <>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                style={{ border: '2px dashed #DFE1E6', borderRadius: '8px', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: '#FAFBFC' }}
                            >
                                <UploadCloud size={40} color="#0052CC" style={{ margin: '0 auto 12px' }} />
                                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600, color: '#172B4D' }}>Upload CSV File</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>Drag and drop or click to upload</p>
                                <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <button onClick={downloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#0052CC', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                                    <FileText size={16} /> Download CSV Template
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid #36B37E', background: '#E3FCEF', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircle size={24} color="#006644" />
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#006644' }}>{stats.valid}</div>
                                        <div style={{ fontSize: '13px', color: '#006644', fontWeight: 600 }}>Valid</div>
                                    </div>
                                </div>
                                <div style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid #FF5630', background: '#FFEBE6', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <AlertTriangle size={24} color="#DE350B" />
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#DE350B' }}>{stats.invalid}</div>
                                        <div style={{ fontSize: '13px', color: '#DE350B', fontWeight: 600 }}>Invalid</div>
                                    </div>
                                </div>
                                <div style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid #FFAB00', background: '#FFF0B3', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <AlertTriangle size={24} color="#FF8B00" />
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#FF8B00' }}>{stats.duplicate}</div>
                                        <div style={{ fontSize: '13px', color: '#FF8B00', fontWeight: 600 }}>Duplicates</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div style={{ padding: '20px 24px', borderTop: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={resetAndClose} style={{ height: '40px', padding: '0 20px', borderRadius: '4px', border: 'none', background: 'transparent', color: '#42526E', fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    {parsedData.length > 0 && (
                        <button 
                            disabled={loading || stats.valid === 0}
                            onClick={handleSubmit}
                            style={{ height: '40px', padding: '0 20px', borderRadius: '4px', border: 'none', background: '#0052CC', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: (loading || stats.valid === 0) ? 0.7 : 1 }}
                        >
                            {loading ? 'Sending...' : `Send ${stats.valid} Invitations`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
