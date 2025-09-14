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
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showEntryForm, setShowEntryForm] = useState<boolean>(true);
    const [editingEntry, setEditingEntry] = useState<LogbookEntry | null>(null);
    const [activity, setActivity] = useState<string>('');
    const [workType, setWorkType] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState<boolean>(false);
    const [duplicateEntry, setDuplicateEntry] = useState<LogbookEntry | null>(null);

    // Fetch all logbook entries for the current user
    const fetchEntries = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch entries for the last 30 days
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            
            const startDateString = startDate.toISOString().split('T')[0];
            const endDateString = endDate.toISOString().split('T')[0];

            const response = await fetch(`/api/logbook?startDate=${startDateString}&endDate=${endDateString}`, {
                credentials: 'include' // Ensure cookies are sent
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch logbook entries');
            }
            const data: LogbookEntry[] = await response.json();
            setEntries(data);
            
            // NOTE: We no longer automatically load the most recent entry for editing
            // This allows users to start with a clean form
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    // Handle creating a new entry
    const handleCreateEntry = () => {
        setEditingEntry(null);
        setActivity('');
        setWorkType('');
        setStartTime('');
        setEndTime('');
        setShowEntryForm(true);
        // Set selected date to today
        setSelectedDate(new Date());
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
                credentials: 'include', // Ensure cookies are sent
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
                // Handle duplicate entry error specifically
                if (response.status === 409) {
                    // Use the entry data from the API response
                    if (data.entry) {
                        setDuplicateEntry(data.entry);
                        setShowDuplicateDialog(true);
                    } else {
                        // Fallback if entry data is not provided
                        setMessage({ text: data.message || 'A logbook entry already exists for this date', type: 'error' });
                        setTimeout(() => setMessage(null), 5000);
                    }
                    return;
                }
                throw new Error(data.message || `Failed to ${editingEntry ? 'update' : 'create'} logbook entry`);
            }

            const savedEntry = await response.json();
            setShowEntryForm(false);
            setMessage({ 
                text: editingEntry ? 'Logbook entry updated successfully' : 'Logbook entry created successfully', 
                type: 'success' 
            });
            setTimeout(() => setMessage(null), 5000); // Hide message after 5 seconds
            // Add a small delay to ensure the database is updated
            setTimeout(() => {
                fetchEntries(); // Refresh entries
            }, 500);
        } catch (err: any) {
            setError(err.message);
            setMessage({ text: err.message, type: 'error' });
            setTimeout(() => setMessage(null), 5000); // Hide message after 5 seconds
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
                credentials: 'include' // Ensure cookies are sent
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete logbook entry');
            }

            setMessage({ text: 'Logbook entry deleted successfully', type: 'success' });
            setTimeout(() => setMessage(null), 5000); // Hide message after 5 seconds
            fetchEntries(); // Refresh entries
        } catch (err: any) {
            setError(err.message);
            setMessage({ text: err.message, type: 'error' });
            setTimeout(() => setMessage(null), 5000); // Hide message after 5 seconds
        }
    };

    // Handle viewing/editing a duplicate entry
    const handleViewEditDuplicate = () => {
        setShowDuplicateDialog(false);
        if (duplicateEntry) {
            handleEditEntry(duplicateEntry);
        } else {
            setMessage({ text: 'Error: Could not load the existing entry', type: 'error' });
            setTimeout(() => setMessage(null), 5000);
        }
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
                    onClick={handleCreateEntry}
                >
                    New Entry
                </button>
            </div>
            
            {message && (
                <div className={`p-3.5 rounded-md mb-4 ${
                    message.type === 'success' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Entry Form Section */}{/* Entry Form Section */}
            <div className="panel mb-6">
                <h3 className="text-lg font-bold mb-4">
                    {editingEntry ? 'Edit Logbook Entry' : 'Create New Logbook Entry'}
                </h3>
                
                {error && (
                    <div className="p-3.5 rounded-md bg-danger-light text-danger mb-4">
                        {error}
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        />
                    </div>
                    
                    <div>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

            {/* Historical Entries Section */}
            <div className="panel">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Historical Entries</h3>
                    <button 
                        type="button" 
                        className="btn btn-outline-primary"
                        onClick={fetchEntries}
                    >
                        Refresh
                    </button>
                </div>
                
                {entries.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-lg">No logbook entries found.</p>
                        <p className="text-gray-500 mt-2">
                            Create your first logbook entry using the form above.
                        </p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Activity</th>
                                    <th>Work Type</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>{new Date(entry.entry_date).toLocaleDateString()}</td>
                                        <td>
                                            <div className="max-w-xs truncate" title={entry.activity}>
                                                {entry.activity}
                                            </div>
                                        </td>
                                        <td>{entry.work_type || '-'}</td>
                                        <td>
                                            {entry.start_time && entry.end_time 
                                                ? `${entry.start_time} - ${entry.end_time}` 
                                                : '-'}
                                        </td>
                                        <td>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                entry.status ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {entry.status ? 
                                                    entry.status.charAt(0).toUpperCase() + entry.status.slice(1) : 
                                                    'No Status'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                type="button" 
                                                className="btn btn-sm btn-outline-primary mr-2"
                                                onClick={() => handleEditEntry(entry)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteEntry(entry.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Duplicate Entry Dialog */}
            {showDuplicateDialog && duplicateEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-black rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Duplicate Entry Warning</h3>
                        <p className="mb-4">A logbook entry already exists for {selectedDate.toLocaleDateString()}.</p>
                        
                        {message && (
                            <div className={`p-3.5 rounded-md mb-4 ${
                                message.type === 'success' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                                {message.text}
                            </div>
                        )}
                        
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4">
                            <h4 className="font-semibold mb-2">Existing Entry:</h4>
                            <p className="text-sm mb-2">{duplicateEntry.activity.substring(0, 25)}{duplicateEntry.activity.length > 25 ? '...' : ''}</p>
                            <div className="flex justify-between text-xs">
                                <span>Status: {duplicateEntry.status || 'No Status'}</span>
                                <span>
                                    {duplicateEntry.start_time && duplicateEntry.end_time 
                                        ? `${duplicateEntry.start_time} - ${duplicateEntry.end_time}` 
                                        : 'No time specified'}
                                </span>
                            </div>
                        </div>
                        
                        <p className="mb-4">Would you like to view/edit the existing entry?</p>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowDuplicateDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleViewEditDuplicate}
                            >
                                View/Edit Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogbookPage;