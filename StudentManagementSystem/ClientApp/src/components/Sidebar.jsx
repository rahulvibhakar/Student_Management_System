import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') return null;

  return (
    <div className="sidebar">
      <ul>
        {user.role === 'Admin' && (
          <>
            <li className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
              <Link to="/admin/dashboard">Dashboard</Link>
            </li>
            <li className={location.pathname === '/students' ? 'active' : ''}>
              <Link to="/students">Viewing Student Details</Link>
            </li>
            <li className={location.pathname === '/admin/courses' ? 'active' : ''}>
              <Link to="/admin/courses">Manage Enrollments</Link>
            </li>
            <li className={location.pathname === '/admin/attendance' ? 'active' : ''}>
              <Link to="/admin/attendance">Attendance Tracking</Link>
            </li>
          </>
        )}
        {user.role === 'Student' && (
          <>
            <li className={location.pathname === '/student/dashboard' ? 'active' : ''}>
              <Link to="/student/dashboard">Dashboard</Link>
            </li>
            <li className={location.pathname === '/student/courses' ? 'active' : ''}>
              <Link to="/student/courses">Enroll in Courses</Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};
export default Sidebar;