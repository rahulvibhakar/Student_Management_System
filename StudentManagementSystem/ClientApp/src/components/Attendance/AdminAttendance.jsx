import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import studentService from '../../services/studentService';
import { toast } from 'react-toastify';
import '../CourseAttendance.css';

const AdminAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('present');
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const RECORDS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [studentsRes, attendanceRes] = await Promise.all([
        studentService.getAllStudents(),
        api.get('/attendance')
      ]);
      if (studentsRes.success) setStudents(studentsRes.data);
      if (attendanceRes.data.success) setAttendanceRecords(attendanceRes.data.data);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.warn('Please select a student');
      return;
    }

    try {
      const response = await api.post('/attendance', {
        studentId: parseInt(selectedStudent),
        date: selectedDate,
        isPresent: status === 'present'
      });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to save attendance');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      const response = await api.delete(`/attendance/${id}`);
      if (response.data.success) {
        toast.success('Record deleted');
        fetchData();
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const totalPages = Math.ceil(attendanceRecords.length / RECORDS_PER_PAGE);
  const paginatedRecords = attendanceRecords.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="attendance-container">
      <div className="attendance-card">
        <h2 className="retro-title">Mark Daily Attendance</h2>
        <form onSubmit={handleSubmit} className="form-row">
          <div className="form-group">
            <label>Student:</label>
            <select 
              className="retro-select" 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">-- Select Student --</option>
              {students.map(s => (
                <option key={s.studentId} value={s.studentId}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input 
              type="date" 
              className="retro-input" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select 
              className="retro-select" 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          <button type="submit" className="retro-btn">Save Attendance</button>
        </form>
      </div>

      <div className="attendance-card">
        <h2 className="retro-title">Attendance History</h2>
        <table className="retro-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.map(rec => (
              <tr key={rec.attendanceId}>
                <td>{new Date(rec.date).toLocaleDateString()}</td>
                <td>{rec.studentName}</td>
                <td>
                  <span className={`status-badge ${rec.isPresent ? 'present' : 'absent'}`}>
                    {rec.isPresent ? 'Present' : 'Absent'}
                  </span>
                </td>
                <td>
                  <button className="retro-btn delete" onClick={() => handleDelete(rec.attendanceId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination-bar" style={{marginTop: '20px', padding: '10px', borderTop: '1px solid #c5a059'}}>
            <div className="pagination-controls">
              <button 
                className="page-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >Prev</button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >{i + 1}</button>
              ))}
              <button 
                className="page-btn" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
