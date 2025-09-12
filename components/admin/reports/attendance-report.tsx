'use client';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface AttendanceRecord {
    id: number;
    fullName: string;
    studentId: string;
    division: string;
    clockInTime: string;
    clockOutTime: string | null;
    latitude: number;
    longitude: number;
}

const AttendanceReport = () => {
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('date');

    const fetchAttendanceData = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '/api/admin/reports/attendance';
            const params = new URLSearchParams();
            
            if (startDate) {
                params.append('startDate', startDate);
            }
            
            if (endDate) {
                params.append('endDate', endDate);
            }
            
            params.append('filterType', filterType);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch attendance data');
            }
            const data = await response.json();
            setAttendanceData(data.data);
        } catch (err: any) {
            setError(err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const handleFilter = () => {
        fetchAttendanceData();
    };

    const handleExportToExcel = () => {
        try {
            // Prepare data for export
            const exportData = attendanceData.map(record => ({
                'User Name': record.fullName,
                'Student ID': record.studentId,
                'Division': record.division || 'N/A',
                'Clock In Time': formatDate(record.clockInTime),
                'Clock Out Time': record.clockOutTime ? formatDate(record.clockOutTime) : 'Not clocked out',
                'Latitude': record.latitude,
                'Longitude': record.longitude
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
            
            // Export to Excel
            XLSX.writeFile(wb, 'attendance_report.xlsx');
            
            Swal.fire({
                icon: 'success',
                title: 'Export Successful',
                text: 'Attendance report exported to Excel successfully.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: 'Failed to export attendance report to Excel.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        }
    };

    const handleExportToPDF = () => {
        try {
            // Create PDF document
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(18);
            doc.text('Attendance Report', 14, 22);
            
            // Add date
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
            
            // Prepare table data
            const tableData = attendanceData.map(record => [
                record.fullName,
                record.studentId,
                record.division || 'N/A',
                formatDate(record.clockInTime),
                record.clockOutTime ? formatDate(record.clockOutTime) : 'Not clocked out',
                `${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)}`
            ]);
            
            // Add table
            (doc as any).autoTable({
                head: [['User Name', 'Student ID', 'Division', 'Clock In', 'Clock Out', 'Location']],
                body: tableData,
                startY: 40,
                styles: {
                    fontSize: 8
                },
                headStyles: {
                    fillColor: [67, 97, 238] // Primary color
                }
            });
            
            // Save PDF
            doc.save('attendance_report.pdf');
            
            Swal.fire({
                icon: 'success',
                title: 'Export Successful',
                text: 'Attendance report exported to PDF successfully.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: 'Failed to export attendance report to PDF.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleTimeString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-3.5 rounded-md bg-danger-light text-danger">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Attendance Report</h2>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">Filter Type</label>
                    <select
                        className="form-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="date">By Date</option>
                        <option value="week">By Week</option>
                        <option value="month">By Month</option>
                    </select>
                </div>
                
                <div className="flex items-end">
                    <button
                        type="button"
                        className="btn btn-primary w-full"
                        onClick={handleFilter}
                    >
                        Apply Filter
                    </button>
                </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-3 mb-6">
                <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleExportToExcel}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ltr:mr-2 rtl:ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export to Excel
                </button>
                
                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleExportToPDF}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ltr:mr-2 rtl:ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export to PDF
                </button>
            </div>

            {/* Attendance Data Table */}
            {attendanceData.length === 0 ? (
                <div className="text-center py-8">
                    <p>No attendance records found.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>User Name</th>
                                <th>Student ID</th>
                                <th>Division</th>
                                <th>Clock In</th>
                                <th>Clock Out</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceData.map((record) => (
                                <tr key={record.id}>
                                    <td>{record.fullName}</td>
                                    <td>{record.studentId}</td>
                                    <td>{record.division || 'N/A'}</td>
                                    <td>{formatDate(record.clockInTime)}</td>
                                    <td>{record.clockOutTime ? formatDate(record.clockOutTime) : 'Not clocked out'}</td>
                                    <td>
                                        {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary */}
            {attendanceData.length > 0 && (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                    <h3 className="text-lg font-semibold mb-2">Report Summary</h3>
                    <p>Total Records: {attendanceData.length}</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceReport;