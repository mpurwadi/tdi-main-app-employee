// app/(defaults)/admin/remote-schedule/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const RemoteSchedulePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for schedule generation
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [method, setMethod] = useState('Satu kali remote per minggu');
  const [allInterns, setAllInterns] = useState<any[]>([]);
  const [selectedInterns, setSelectedInterns] = useState<any[]>([]);
  const [generatedSchedule, setGeneratedSchedule] = useState<any>(null);
  
  // State for schedule history
  const [scheduleHistory, setScheduleHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [editingDate, setEditingDate] = useState<{scheduleId: number, internId: number, date: string} | null>(null);
  const [newDateValue, setNewDateValue] = useState('');

  // Check authentication and redirect if not admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (!response.ok || !data.isAdmin) {
          router.push('/auth/boxed-signin');
          return;
        }
        
        setIsLoading(false);
      } catch (err) {
        router.push('/auth/boxed-signin');
      }
    };
    
    checkAuth();
  }, [router]);

  // Load interns from database
  useEffect(() => {
    const loadInterns = async () => {
      if (isLoading) return;
      
      try {
        const response = await fetch('/api/admin/remote-schedule/interns');
        const result = await response.json();
        
        if (result.success) {
          setAllInterns(result.data);
        } else {
          setError(result.error || 'Failed to load interns');
        }
      } catch (err) {
        setError('Failed to load interns');
      }
    };
    
    loadInterns();
  }, [isLoading]);

  // Load schedule history
  useEffect(() => {
    const loadScheduleHistory = async () => {
      if (isLoading) return;
      
      try {
        setHistoryLoading(true);
        const response = await fetch('/api/admin/remote-schedule');
        const result = await response.json();
        
        if (result.success) {
          setScheduleHistory(result.data);
        } else {
          setError(result.error || 'Failed to load schedule history');
        }
      } catch (err) {
        setError('Failed to load schedule history');
      } finally {
        setHistoryLoading(false);
      }
    };
    
    loadScheduleHistory();
  }, [isLoading]);

  // Handle intern selection (drag and drop simulation)
  const handleInternSelect = (intern: any) => {
    if (!selectedInterns.some(i => i.id === intern.id)) {
      setSelectedInterns([...selectedInterns, intern]);
    }
  };

  const handleInternRemove = (internId: number) => {
    setSelectedInterns(selectedInterns.filter(i => i.id !== internId));
  };

  // Generate random schedule
  const handleGenerateSchedule = async () => {
    if (!startDate || !endDate || selectedInterns.length === 0) {
      setError('Please fill all required fields and select at least one intern');
      return;
    }

    try {
      const response = await fetch('/api/admin/remote-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          method,
          selectedInterns,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedSchedule(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to generate schedule');
      }
    } catch (err) {
      setError('Failed to generate schedule');
    }
  };

  // Save schedule to database
  const handleSaveSchedule = async () => {
    if (!generatedSchedule) {
      setError('No schedule to save');
      return;
    }

    try {
      const response = await fetch('/api/admin/remote-schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedSchedule),
      });

      const result = await response.json();

      if (result.success) {
        alert('Schedule saved successfully!');
        // Refresh history
        const historyResponse = await fetch('/api/admin/remote-schedule');
        const historyResult = await historyResponse.json();
        if (historyResult.success) {
          setScheduleHistory(historyResult.data);
        }
        // Clear form
        setStartDate('');
        setEndDate('');
        setMethod('Satu kali remote per minggu');
        setSelectedInterns([]);
        setGeneratedSchedule(null);
      } else {
        setError(result.error || 'Failed to save schedule');
      }
    } catch (err) {
      setError('Failed to save schedule');
    }
  };

  // Start editing a date
  const startEditingDate = (scheduleId: number, internId: number, date: string) => {
    setEditingDate({ scheduleId, internId, date });
    setNewDateValue(date);
  };

  // Save edited date
  const saveEditedDate = async () => {
    if (!editingDate) return;

    try {
      const response = await fetch(`/api/admin/remote-schedule/${editingDate.scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internId: editingDate.internId,
          oldDate: editingDate.date,
          newDate: newDateValue,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh history
        const historyResponse = await fetch('/api/admin/remote-schedule');
        const historyResult = await historyResponse.json();
        if (historyResult.success) {
          setScheduleHistory(historyResult.data);
        }
        setEditingDate(null);
        setNewDateValue('');
        alert('Date updated successfully!');
      } else {
        setError(result.error || 'Failed to update date');
      }
    } catch (err) {
      setError('Failed to update date');
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingDate(null);
    setNewDateValue('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="panel">
      <h1 className="text-2xl font-bold mb-6">Remote Schedule Management</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-danger-light text-danger rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Schedule Generation Section */}
        <div className="panel">
          <h2 className="text-xl font-bold mb-4">Generate New Schedule</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <label className="block text-xs text-gray-500 mt-1">Start Date</label>
                </div>
                <div>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <label className="block text-xs text-gray-500 mt-1">End Date</label>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <select
                className="form-select"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="Satu kali remote per minggu">Satu kali remote per minggu</option>
                <option value="Dua kali remote per minggu">Dua kali remote per minggu</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Select Interns</label>
              <div className="grid grid-cols-2 gap-4">
                {/* Available Interns */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Available Interns</h3>
                  <div className="border rounded p-2 h-64 overflow-y-auto">
                    {allInterns
                      .filter(intern => !selectedInterns.some(i => i.id === intern.id))
                      .map(intern => (
                        <div
                          key={intern.id}
                          className="p-2 mb-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleInternSelect(intern)}
                        >
                          <div className="font-medium">{intern.name}</div>
                          <div className="text-sm text-gray-500">{intern.email}</div>
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Selected Interns */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Selected Interns ({selectedInterns.length})</h3>
                  <div className="border rounded p-2 h-64 overflow-y-auto">
                    {selectedInterns.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No interns selected
                      </div>
                    ) : (
                      selectedInterns.map(intern => (
                        <div
                          key={intern.id}
                          className="p-2 mb-2 bg-white dark:bg-gray-800 rounded flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">{intern.name}</div>
                            <div className="text-sm text-gray-500">{intern.email}</div>
                          </div>
                          <button
                            type="button"
                            className="text-danger"
                            onClick={() => handleInternRemove(intern.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                className="btn btn-primary"
                onClick={handleGenerateSchedule}
                disabled={selectedInterns.length === 0}
              >
                Generate Random Schedule
              </button>
            </div>
          </div>
        </div>
        
        {/* Schedule Preview Section */}
        <div className="panel">
          <h2 className="text-xl font-bold mb-4">Schedule Preview</h2>
          
          {generatedSchedule ? (
            <div>
              <div className="mb-4 p-3 bg-info-light dark:bg-info text-info dark:text-info-light rounded">
                <div className="font-medium">Schedule Preview</div>
                <div className="text-sm">
                  Period: {generatedSchedule.startDate} to {generatedSchedule.endDate}
                </div>
                <div className="text-sm">Method: {generatedSchedule.method}</div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Intern Name</th>
                      <th>Remote Date(s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedSchedule.schedule.map((intern: any) => (
                      <tr key={intern.id}>
                        <td>{intern.name}</td>
                        <td>
                          {intern.remoteDates.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  className="btn btn-success"
                  onClick={handleSaveSchedule}
                >
                  Save to Database
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Generate a schedule to see the preview here
            </div>
          )}
        </div>
      </div>
      
      {/* Schedule History Section */}
      <div className="panel">
        <h2 className="text-xl font-bold mb-4">Schedule History</h2>
        
        {historyLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : scheduleHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No schedule history found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Method</th>
                  <th>Interns Count</th>
                  <th>Created At</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {scheduleHistory.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>{schedule.startDate} to {schedule.endDate}</td>
                    <td>{schedule.method}</td>
                    <td>{schedule.interns.length} interns</td>
                    <td>{new Date(schedule.createdAt).toLocaleDateString()}</td>
                    <td>
                      <details className="collapse collapse-arrow">
                        <summary className="collapse-title text-xs">View Details</summary>
                        <div className="collapse-content">
                          {schedule.interns.map((intern: any) => (
                            <div key={`${schedule.id}-${intern.id}`} className="mb-2 p-2 border-b border-gray-200 dark:border-gray-700">
                              <div className="font-medium">{intern.name}</div>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {intern.remoteDates.map((date: string, index: number) => (
                                  <div key={`${schedule.id}-${intern.id}-${date}`} className="flex items-center">
                                    {editingDate?.scheduleId === schedule.id && 
                                     editingDate?.internId === intern.id && 
                                     editingDate?.date === date ? (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="date"
                                          className="form-input text-xs p-1"
                                          value={newDateValue}
                                          onChange={(e) => setNewDateValue(e.target.value)}
                                        />
                                        <button 
                                          className="btn btn-success btn-xs"
                                          onClick={saveEditedDate}
                                        >
                                          Save
                                        </button>
                                        <button 
                                          className="btn btn-secondary btn-xs"
                                          onClick={cancelEditing}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                                          {date}
                                        </span>
                                        <button 
                                          className="btn btn-primary btn-xs"
                                          onClick={() => startEditingDate(schedule.id, intern.id, date)}
                                        >
                                          Edit
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoteSchedulePage;