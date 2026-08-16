
"use client";

import React, { useState } from 'react';
import { Search, Upload, FolderPlus, FileText, Image as ImageIcon, FileArchive, Download, MoreHorizontal, Grid, List as ListIcon, Folder } from 'lucide-react';

export default function ProjectFilesTab({ project, files }: { project: any, files: any[] }) {
    const [view, setView] = useState('list');
    
    const mockFolders = [
        { id: '1', name: 'Design Assets', count: 12, date: 'Aug 1, 2026' },
        { id: '2', name: 'Contracts', count: 3, date: 'Jul 28, 2026' },
        { id: '3', name: 'Meeting Notes', count: 8, date: 'Aug 10, 2026' },
    ];

    const allFiles = [
        ...files.map(f => ({ ...f, icon: FileText })),
        { id: 'm1', name: 'Q3_Strategy_Deck.pdf', type: 'application/pdf', size: 2450000, uploadedBy: 'Sayab Abbasi', createdAt: '2026-08-12T10:00:00Z', icon: FileText },
        { id: 'm2', name: 'Hero_Image_Final.png', type: 'image/png', size: 4800000, uploadedBy: 'Ali Design', createdAt: '2026-08-14T14:30:00Z', icon: ImageIcon },
        { id: 'm3', name: 'Product_Brief_v2.docx', type: 'application/msword', size: 120000, uploadedBy: 'Sayab Abbasi', createdAt: '2026-08-15T09:15:00Z', icon: FileText },
        { id: 'm4', name: 'Assets_Archive.zip', type: 'application/zip', size: 56000000, uploadedBy: 'Sara Dev', createdAt: '2026-08-10T16:45:00Z', icon: FileArchive },
    ];

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} color="#8A94A6" style={{ position: 'absolute', left: 12, top: 10 }} />
                        <input type="text" placeholder="Search files..." style={{ padding: '8px 12px 8px 32px', border: '1px solid #DFE1E6', borderRadius: 8, fontSize: 13, width: 240, outline: 'none' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: '#F4F5F7', padding: 4, borderRadius: 8 }}>
                        <div onClick={() => setView('list')} style={{ padding: '6px', cursor: 'pointer', borderRadius: 4, background: view === 'list' ? 'white' : 'transparent', color: view === 'list' ? '#0052CC' : '#6B778C', boxShadow: view === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}><ListIcon size={16} /></div>
                        <div onClick={() => setView('grid')} style={{ padding: '6px', cursor: 'pointer', borderRadius: 4, background: view === 'grid' ? 'white' : 'transparent', color: view === 'grid' ? '#0052CC' : '#6B778C', boxShadow: view === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}><Grid size={16} /></div>
                    </div>
                    <button className="btn-secondary"><FolderPlus size={14} /> New Folder</button>
                    <button className="btn-primary"><Upload size={14} /> Upload File</button>
                </div>
            </div>

            {/* Folders (Grid) */}
            <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#172B4D', margin: '0 0 16px 0' }}>Folders</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {mockFolders.map(f => (
                        <div key={f.id} className="p-panel" style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', transition: 'all 0.2s' }} onClick={(e) => e.currentTarget.style.borderColor = '#0052CC'}>
                            <Folder size={24} color="#0052CC" fill="#E6EFFF" />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', marginBottom: 4 }}>{f.name}</div>
                                <div style={{ fontSize: 11, color: '#8A94A6', fontWeight: 600 }}>{f.count} files • {f.date}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Files List */}
            <div className="p-panel" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #DFE1E6', background: '#F8F9FA', padding: '12px 24px', fontSize: 12, fontWeight: 700, color: '#5E6C84' }}>
                    <div style={{ flex: 2 }}>Name</div>
                    <div style={{ flex: 1 }}>Size</div>
                    <div style={{ flex: 1 }}>Uploaded By</div>
                    <div style={{ flex: 1 }}>Date Modified</div>
                    <div style={{ width: 40 }}></div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {allFiles.map(f => (
                        <div key={f.id} style={{ display: 'flex', borderBottom: '1px solid #EBECF0', padding: '12px 24px', alignItems: 'center', transition: 'background 0.2s', cursor: 'pointer' }} className="hover:bg-gray-50">
                            <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#42526E' }}>
                                    <f.icon size={16} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#172B4D' }}>{f.name}</span>
                            </div>
                            <div style={{ flex: 1, fontSize: 12, color: '#6B778C', fontWeight: 500 }}>{formatSize(f.size)}</div>
                            <div style={{ flex: 1, fontSize: 12, color: '#172B4D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#4C9AFF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>SA</div>
                                {f.uploadedBy || 'Sayab Abbasi'}
                            </div>
                            <div style={{ flex: 1, fontSize: 12, color: '#6B778C', fontWeight: 500 }}>{new Date(f.createdAt).toLocaleDateString()}</div>
                            <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><Download size={16} /></button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><MoreHorizontal size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
