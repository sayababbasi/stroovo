import Sidebar from '@/components/Sidebar';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function CalendarPage() {
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Generate calendar days
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const calendarDays = Array.from({ length: 42 }, (_, i) => {
        const dayNum = i - firstDay + 1;
        return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null;
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                <div style={{ padding: '24px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Calendar</h1>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <button style={{ padding: '6px', border: '1px solid #DFE1E6', borderRadius: '4px', background: 'white', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                            <span style={{ padding: '6px 16px', fontWeight: 600 }}>{monthName}</span>
                            <button style={{ padding: '6px', border: '1px solid #DFE1E6', borderRadius: '4px', background: 'white', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                        </div>
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
                        <Plus size={16} />
                        New Event
                    </button>
                </div>

                <div style={{ padding: '24px 32px' }}>
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', overflow: 'hidden' }}>
                        {/* Day Headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #DFE1E6' }}>
                            {days.map(day => (
                                <div key={day} style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6B778C', background: '#F4F5F7' }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                            {calendarDays.map((day, i) => (
                                <div key={i} style={{
                                    minHeight: '100px',
                                    padding: '8px',
                                    borderRight: (i + 1) % 7 !== 0 ? '1px solid #EBECF0' : 'none',
                                    borderBottom: i < 35 ? '1px solid #EBECF0' : 'none',
                                    background: day === today.getDate() ? '#DEEBFF' : 'white'
                                }}>
                                    {day && (
                                        <>
                                            <div style={{ fontSize: '14px', fontWeight: day === today.getDate() ? 700 : 400, color: day === today.getDate() ? '#0052CC' : '#172B4D' }}>
                                                {day}
                                            </div>
                                            {day === 15 && (
                                                <div style={{ marginTop: '4px', padding: '4px 6px', background: '#0052CC', color: 'white', borderRadius: '3px', fontSize: '11px' }}>
                                                    Team Meeting
                                                </div>
                                            )}
                                            {day === 22 && (
                                                <div style={{ marginTop: '4px', padding: '4px 6px', background: '#36B37E', color: 'white', borderRadius: '3px', fontSize: '11px' }}>
                                                    Sprint Review
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
