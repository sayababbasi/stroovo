"use client";

import React, { useState } from 'react';
import { Search, Filter, Calendar, X, Download } from 'lucide-react';

export default function AdminAuditFilter({ filters, onFilterChange, onExport, permissions }: any) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, search: e.target.value });
    };

    const handleSelectChange = (key: string, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFilterChange({ search: '', action: '', severity: '', result: '', startDate: '', endDate: '' });
    };

    return (
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #DFE1E6', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                
                {/* Search Bar */}
                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                    <Search size={16} color="#6B778C" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input 
                        type="text" 
                        placeholder="Search by actor, resource, or action..." 
                        value={filters.search || ''}
                        onChange={handleTextChange}
                        style={{ width: '100%', height: '40px', padding: '0 12px 0 36px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none' }}
                    />
                </div>

                {/* Quick Filters */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select 
                        value={filters.severity || ''} 
                        onChange={e => handleSelectChange('severity', e.target.value)}
                        style={{ height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', background: 'white' }}
                    >
                        <option value="">All Severities</option>
                        <option value="INFO">Info</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>

                    <select 
                        value={filters.result || ''} 
                        onChange={e => handleSelectChange('result', e.target.value)}
                        style={{ height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', background: 'white' }}
                    >
                        <option value="">All Results</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                        <option value="BLOCKED">Blocked</option>
                    </select>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 16px', background: isExpanded ? '#EBECF0' : 'white', border: '1px solid #DFE1E6', borderRadius: '6px', cursor: 'pointer', color: '#42526E', fontWeight: 500, fontSize: '14px' }}
                    >
                        <Filter size={16} /> Filters
                    </button>
                    
                    {(filters.search || filters.severity || filters.result || filters.action || filters.startDate) && (
                        <button 
                            onClick={clearFilters}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 16px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '6px', cursor: 'pointer', color: '#DE350B', fontWeight: 500, fontSize: '14px' }}
                        >
                            <X size={16} /> Clear
                        </button>
                    )}

                    {permissions?.canExport && (
                        <button 
                            onClick={onExport}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 16px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '6px', cursor: 'pointer', color: '#0052CC', fontWeight: 500, fontSize: '14px' }}
                        >
                            <Download size={16} /> Export
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded Filters */}
            {isExpanded && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #DFE1E6', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', display: 'block', marginBottom: '4px' }}>Action Type</label>
                        <input 
                            type="text" 
                            placeholder="e.g. ROLE_CREATED" 
                            value={filters.action || ''}
                            onChange={e => handleSelectChange('action', e.target.value)}
                            style={{ width: '200px', height: '36px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', display: 'block', marginBottom: '4px' }}>Start Date</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={14} color="#6B778C" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                            <input 
                                type="date" 
                                value={filters.startDate || ''}
                                onChange={e => handleSelectChange('startDate', e.target.value)}
                                style={{ width: '150px', height: '36px', padding: '0 12px 0 32px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', display: 'block', marginBottom: '4px' }}>End Date</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={14} color="#6B778C" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                            <input 
                                type="date" 
                                value={filters.endDate || ''}
                                onChange={e => handleSelectChange('endDate', e.target.value)}
                                style={{ width: '150px', height: '36px', padding: '0 12px 0 32px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
