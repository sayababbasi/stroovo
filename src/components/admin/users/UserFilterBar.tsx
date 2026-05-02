import { 
    Search, Filter, X, ChevronDown, ListFilter, 
    SortAsc, RotateCcw, LayoutGrid, List,
    TrendingUp, Activity, Calendar
} from 'lucide-react';

interface UserFilterBarProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    roleFilter: string;
    onRoleFilterChange: (val: string) => void;
    statusFilter: string;
    onStatusFilterChange: (val: string) => void;
    departmentFilter: string;
    onDepartmentFilterChange: (val: string) => void;
    experienceFilter: string;
    onExperienceFilterChange: (val: string) => void;
    sortBy: string;
    onSortChange: (val: string) => void;
    viewMode: 'table' | 'grid';
    onViewModeChange: (val: 'table' | 'grid') => void;
    onReset: () => void;
}

export default function UserFilterBar({
    searchTerm,
    onSearchChange,
    roleFilter,
    onRoleFilterChange,
    statusFilter,
    onStatusFilterChange,
    departmentFilter,
    onDepartmentFilterChange,
    experienceFilter,
    onExperienceFilterChange,
    sortBy,
    onSortChange,
    viewMode,
    onViewModeChange,
    onReset
}: UserFilterBarProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ 
                background: 'white', 
                padding: '16px 20px', 
                borderRadius: '16px', 
                border: '1px solid #EBECF0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
            }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
                    <Search size={16} color="#6B778C" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Search by name, email, department or skills..." 
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            background: '#F4F5F7',
                            border: '1px solid #EBECF0',
                            borderRadius: '10px',
                            fontSize: '14px',
                            color: '#172B4D',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                    />
                </div>

                {/* View Toggles */}
                <div style={{ display: 'flex', background: '#F4F5F7', padding: '4px', borderRadius: '10px', gap: '2px' }}>
                    <button
                        onClick={() => onViewModeChange('table')}
                        style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '8px',
                            background: viewMode === 'table' ? 'white' : 'transparent',
                            color: viewMode === 'table' ? '#0052CC' : '#6B778C',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: 700,
                            boxShadow: viewMode === 'table' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        <List size={16} /> Table
                    </button>
                    <button
                        onClick={() => onViewModeChange('grid')}
                        style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '8px',
                            background: viewMode === 'grid' ? 'white' : 'transparent',
                            color: viewMode === 'grid' ? '#0052CC' : '#6B778C',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: 700,
                            boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        <LayoutGrid size={16} /> Grid
                    </button>
                </div>
            </div>

            {/* Advanced Filters & Sort */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                {/* Role */}
                <select 
                    value={roleFilter}
                    onChange={(e) => onRoleFilterChange(e.target.value)}
                    style={{ padding: '8px 12px', background: 'white', border: '1px solid #EBECF0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#42526E', outline: 'none' }}
                >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="PROJECT_MANAGER">Manager</option>
                    <option value="TEAM_MEMBER">Member</option>
                </select>

                {/* Department */}
                <select 
                    value={departmentFilter}
                    onChange={(e) => onDepartmentFilterChange(e.target.value)}
                    style={{ padding: '8px 12px', background: 'white', border: '1px solid #EBECF0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#42526E', outline: 'none' }}
                >
                    <option value="ALL">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Product">Product</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                </select>

                {/* Experience */}
                <select 
                    value={experienceFilter}
                    onChange={(e) => onExperienceFilterChange(e.target.value)}
                    style={{ padding: '8px 12px', background: 'white', border: '1px solid #EBECF0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#42526E', outline: 'none' }}
                >
                    <option value="ALL">Any Level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                </select>

                {/* Status */}
                <select 
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                    style={{ padding: '8px 12px', background: 'white', border: '1px solid #EBECF0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#42526E', outline: 'none' }}
                >
                    <option value="ALL">Any Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>

                <div style={{ width: '1px', height: '24px', background: '#EBECF0', margin: '0 8px' }} />

                {/* Sort */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Sort by:</span>
                    <select 
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        style={{ padding: '8px 12px', background: 'white', border: '1px solid #EBECF0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#172B4D', outline: 'none' }}
                    >
                        <option value="newest">Newest Join</option>
                        <option value="performance">Top Performance</option>
                        <option value="workload">Highest Workload</option>
                        <option value="tasks">Active Tasks</option>
                    </select>
                </div>

                <button 
                    onClick={onReset}
                    style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'transparent', border: '1px solid #EBECF0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#6B778C', cursor: 'pointer' }}
                >
                    <RotateCcw size={14} /> Clear All
                </button>
            </div>
        </div>
    );
}
