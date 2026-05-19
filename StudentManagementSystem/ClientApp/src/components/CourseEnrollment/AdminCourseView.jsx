import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../CourseAttendance.css';

const AdminCourseView = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newCourseId, setNewCourseId] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const RECORDS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [enrRes, coursesRes] = await Promise.all([
        api.get('/courses/all-enrollments'),
        api.get('/courses')
      ]);
      if (enrRes.data.success) setEnrollments(enrRes.data.data);
      if (coursesRes.data.success) setCourses(coursesRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!newCourseId) return;
    try {
      const response = await api.put(`/courses/enrollments/${id}`, { courseId: parseInt(newCourseId) });
      if (response.data.success) {
        toast.success('Enrollment updated');
        setEditingId(null);
        fetchData();
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enrollment?')) return;
    try {
      const response = await api.delete(`/courses/enrollments/${id}`);
      if (response.data.success) {
        toast.success('Enrollment deleted');
        fetchData();
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const totalPages = Math.ceil(enrollments.length / RECORDS_PER_PAGE);
  const paginatedEnrollments = enrollments.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="course-container">
      <div className="course-card">
        <h2 className="retro-title">Manage Student Enrollments</h2>
        <table className="retro-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Current Course</th>
              <th>Course Code</th>
              <th>Enrolled Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEnrollments.map(enr => (
              <tr key={enr.enrollmentId}>
                <td>{enr.studentName}</td>
                <td>
                  {editingId === enr.enrollmentId ? (
                    <select 
                      className="retro-select"
                      value={newCourseId}
                      onChange={(e) => setNewCourseId(e.target.value)}
                    >
                      {courses.map(c => (
                        <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
                      ))}
                    </select>
                  ) : (
                    enr.courseName
                  )}
                </td>
                <td>{enr.courseCode}</td>
                <td>{new Date(enr.enrolledAt).toLocaleDateString()}</td>
                <td>
                  {editingId === enr.enrollmentId ? (
                    <>
                      <button className="retro-btn" onClick={() => handleUpdate(enr.enrollmentId)}>Save</button>
                      <button className="retro-btn" onClick={() => setEditingId(null)} style={{marginLeft: '5px'}}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="retro-btn" onClick={() => {
                        setEditingId(enr.enrollmentId);
                        setNewCourseId(enr.courseId);
                      }}>Change Course</button>
                      <button className="retro-btn delete" onClick={() => handleDelete(enr.enrollmentId)} style={{marginLeft: '5px'}}>Remove</button>
                    </>
                  )}
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

export default AdminCourseView;
