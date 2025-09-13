// app/(defaults)/admin/remote-schedule/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { verifyAuth, isAdmin } from '@/lib/auth';
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

  // Check authentication and redirect if not admin
  useEffect(() => {
    try {
      const auth = verifyAuth();
      if (!isAdmin(auth)) {
        router.push('/');
        return;
      }
      setIsLoading(false);
      
      // Load interns (mock data for now)
      const mockInterns = [
        { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
        { id: 3, name: 'Robert Johnson', email: 'robert.johnson@example.com' },
        { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com' },
        { id: 5, name: 'Michael Wilson', email: 'michael.wilson@example.com' },
        { id: 6, name: 'Sarah Brown', email: 'sarah.brown@example.com' },
        { id: 7, name: 'David Miller', email: 'david.miller@example.com' },
        { id: 8, name: 'Lisa Wilson', email: 'lisa.wilson@example.com' },
      ];
      setAllInterns(mockInterns);
    } catch (err) {
      router.push('/auth/boxed-signin');
    }
  }, [router]);

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
        // Clear generated schedule
        setGeneratedSchedule(null);
      } else {
        setError(result.error || 'Failed to save schedule');
      }
    } catch (err) {
      setError('Failed to save schedule');
    }
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
                  <th>Interns</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {scheduleHistory.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>{schedule.startDate} to {schedule.endDate}</td>
                    <td>{schedule.method}</td>
                    <td>{schedule.interns.length} interns</td>
                    <td>{new Date(schedule.createdAt).toLocaleDateString()}</td>
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