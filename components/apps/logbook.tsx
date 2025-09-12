'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';

interface LogbookEntry {
    id: number;
    user_id: number;
    entry_date: string;
    activity: string;
    work_type: string | null;
    start_time: string | null;
    end_time: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

const LogbookPage = () => {
    const [entries, setEntries] = useState<LogbookEntry[]>([]);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showEntryForm, setShowEntryForm] = useState<boolean>(false);
    const [editingEntry, setEditingEntry] = useState<LogbookEntry | null>(null);
    const [activity, setActivity] = useState<string>('');
    const [workType, setWorkType] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Get the first day of the month and the number of days in the month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

        return { firstDay, lastDay, daysInMonth, startingDayOfWeek };
    };

    // Fetch logbook entries for the current month
    const fetchEntries = async () => {
        setLoading(true);
        setError(null);
        try {
            const { firstDay, lastDay } = getDaysInMonth(currentMonth);
            const startDate = firstDay.toISOString().split('T')[0];
            const endDate = lastDay.toISOString().split('T')[0];

            const response = await fetch(`/api/logbook?startDate=${startDate}&endDate=${endDate}`);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch logbook entries');
            }
            const data: LogbookEntry[] = await response.json();
            setEntries(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [currentMonth]);

    // Get entries for a specific date
    const getEntriesForDate = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        return entries.filter(entry => entry.entry_date === dateString);
    };

    // Check if a date has any entries
    const hasEntries = (date: Date) => {
        return getEntriesForDate(date).length > 0;
    };

    // Get the status of entries for a date
    const getDateStatus = (date: Date) => {
        const dateEntries = getEntriesForDate(date);
        if (dateEntries.length === 0) return null;
        
        // If any entry is approved, return approved
        if (dateEntries.some(entry => entry.status === 'approved')) return 'approved';
        
        // If any entry is pending, return pending
        if (dateEntries.some(entry => entry.status === 'pending')) return 'pending';
        
        // Otherwise, return rejected
        return 'rejected';
    };

    // Handle creating a new entry
    const handleCreateEntry = (date: Date) => {
        setSelectedDate(date);
        setEditingEntry(null);
        setActivity('');
        setWorkType('');
        setStartTime('');
        setEndTime('');
        setShowEntryForm(true);
    };

    // Handle editing an entry
    const handleEditEntry = (entry: LogbookEntry) => {
        setSelectedDate(new Date(entry.entry_date));
        setEditingEntry(entry);
        setActivity(entry.activity);
        setWorkType(entry.work_type || '');
        setStartTime(entry.start_time || '');
        setEndTime(entry.end_time || '');
        setShowEntryForm(true);
    };

    // Handle saving an entry
    const handleSaveEntry = async () => {
        if (!activity.trim()) {
            setError('Activity description is required');
            return;
        }

        try {
            const dateString = selectedDate.toISOString().split('T')[0];
            
            const response = await fetch('/api/logbook', {
                method: editingEntry ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    entryId: editingEntry?.id,
                    entryDate: dateString,
                    activity,
                    workType,
                    startTime,
                    endTime
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Failed to ${editingEntry ? 'update' : 'create'} logbook entry`);
            }

            setShowEntryForm(false);
            fetchEntries(); // Refresh entries
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Handle deleting an entry
    const handleDeleteEntry = async (entryId: number) => {
        if (!confirm('Are you sure you want to delete this logbook entry?')) {
            return;
        }

        try {
            const response = await fetch(`/api/logbook?entryId=${entryId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete logbook entry');
            }

            fetchEntries(); // Refresh entries
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Navigation functions
    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        setSelectedDate(today);
    };

    // Render calendar
    const renderCalendar = () => {
        const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const hasEntry = hasEntries(date);
            const status = getDateStatus(date);

            let dayClass = "p-2 border border-gray-200 h-24 cursor-pointer";
            if (isToday) dayClass += " bg-blue-100";
            if (isSelected) dayClass += " bg-blue-200";
            
            // Add status indicators
            if (status === 'approved') dayClass += " bg-green-100";
            else if (status === 'pending') dayClass += " bg-yellow-100";
            else if (status === 'rejected') dayClass += " bg-red-100";

            days.push(
                <div 
                    key={day} 
                    className={dayClass}
                    onClick={() => {
                        setSelectedDate(date);
                        if (!hasEntry) {
                            handleCreateEntry(date);
                        }
                    }}
                >
                    <div className="font-medium">{day}</div>
                    {hasEntry && (
                        <div className="mt-1">
                            {getEntriesForDate(date).map(entry => (
                                <div 
                                    key={entry.id} 
                                    className={`text-xs p-1 mb-1 rounded ${
                                        entry.status === 'approved' ? 'bg-green-500 text-white' :
                                        entry.status === 'pending' ? 'bg-yellow-500 text-white' :
                                        'bg-red-500 text-white'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditEntry(entry);
                                    }}
                                >
                                    <div className="truncate">{entry.activity.substring(0, 20)}{entry.activity.length > 20 ? '...' : ''}</div>
                                    <div className="text-xs">
                                        {entry.status === 'approved' ? 'Approved' :
                                         entry.status === 'pending' ? 'Pending' :
                                         'Rejected'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    if (loading) {
        return <div>Loading logbook...</div>;
    }

    if (error) {
        return <div className="p-3.5 rounded-md bg-danger-light text-danger">Error: {error}</div>;
    }

    return (
        <div className="panel">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Logbook</h2>
                <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={goToToday}
                >
                    Today
                </button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={goToPreviousMonth}
                >
                    Previous
                </button>
                <h3 className="text-lg font-semibold">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={goToNextMonth}
                >
                    Next
                </button>
            </div>

            <div className="grid grid-cols-7 gap-0 border border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 bg-gray-100 font-medium text-center border border-gray-200">
                        {day}
                    </div>
                ))}
                {renderCalendar()}
            </div>

            {showEntryForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-black rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">
                            {editingEntry ? 'Edit Logbook Entry' : 'Create Logbook Entry'}
                        </h3>
                        
                        {error && (
                            <div className="p-3.5 rounded-md bg-danger-light text-danger mb-4">
                                {error}
                            </div>
                        )}
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input
                                type="text"
                                className="form-input"
                                value={selectedDate.toLocaleDateString()}
                                readOnly
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Activity</label>
                            <textarea
                                className="form-textarea"
                                rows={4}
                                value={activity}
                                onChange={(e) => setActivity(e.target.value)}
                                placeholder="Describe your activities for this day..."
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Work Type</label>
                            <select
                                className="form-select"
                                value={workType}
                                onChange={(e) => setWorkType(e.target.value)}
                            >
                                <option value="">Select work type</option>
                                <option value="onsite">On-site</option>
                                <option value="remote">Remote</option>
                                <option value="meeting">Meeting</option>
                                <option value="training">Training</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Time</label>
                                <input
                                    type="time"
                                    className="form-input"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Time</label>
                                <input
                                    type="time"
                                    className="form-input"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowEntryForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSaveEntry}
                            >
                                {editingEntry ? 'Update Entry' : 'Create Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6">
                <h4 className="text-md font-semibold mb-3">Legend</h4>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-100 mr-2"></div>
                        <span>Approved</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-100 mr-2"></div>
                        <span>Pending</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-100 mr-2"></div>
                        <span>Rejected</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-100 mr-2"></div>
                        <span>Today</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogbookPage;