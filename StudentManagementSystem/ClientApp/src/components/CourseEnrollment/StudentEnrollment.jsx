import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../CourseAttendance.css';

const StudentEnrollment = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/courses/my-enrollments')
      ]);
      
      if (coursesRes.data.success) setCourses(coursesRes.data.data);
      if (enrollmentsRes.data.success) setMyEnrollments(enrollmentsRes.data.data);
    } catch (error) {
      toast.error('Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      toast.warn('Please select a course');
      return;
    }

    try {
      const response = await api.post('/courses/enroll', { courseId: parseInt(selectedCourse) });
      if (response.data.success) {
        toast.success('Successfully enrolled!');
        setSelectedCourse('');
        fetchInitialData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    }
  };

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="course-container">
      <div className="course-card">
        <h2 className="retro-title">Enroll in New Course</h2>
        <form onSubmit={handleEnroll} className="form-row">
          <div className="form-group">
            <label>Select Engineering Course:</label>
            <select 
              className="retro-select" 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">-- Choose a Course --</option>
              {courses.map(course => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseName} ({course.courseCode})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="retro-btn">Confirm Enrollment</button>
        </form>
      </div>

      <div className="course-card">
        <h2 className="retro-title">My Current Enrollments</h2>
        {myEnrollments.length === 0 ? (
          <p>You haven't enrolled in any courses yet.</p>
        ) : (
          <table className="retro-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Course Code</th>
                <th>Enrolled At</th>
              </tr>
            </thead>
            <tbody>
              {myEnrollments.map(enr => (
                <tr key={enr.enrollmentId}>
                  <td>{enr.courseName}</td>
                  <td>{enr.courseCode}</td>
                  <td>{new Date(enr.enrolledAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentEnrollment;
