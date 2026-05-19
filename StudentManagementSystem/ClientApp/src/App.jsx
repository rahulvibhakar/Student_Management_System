import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import StudentDashboard from './components/StudentDashboard/StudentDashboard';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import './App.css';
import Sidebar from './components/Sidebar';
import StudentEdit from './components/StudentEdit';
import StudentList from './components/StudentList';
import EditStudentList from './components/EditStudentList';
import AdminAttendance from './components/Attendance/AdminAttendance';
import StudentEnrollment from './components/CourseEnrollment/StudentEnrollment';
import AdminCourseView from './components/CourseEnrollment/AdminCourseView';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthContext.Consumer>
          {({ user }) => (
            <div style={{ display: 'flex' }}>
              {user && <Sidebar />}
              <div className="App" style={{ flex: 1, marginLeft: user ? 200 : 0 }}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  <Route
                    path="/student/dashboard"
                    element={
                      <PrivateRoute requiredRole="Student">
                        <StudentDashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/student/edit"
                    element={
                      <PrivateRoute requiredRole="Student">
                        <StudentEdit />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/student/courses"
                    element={
                      <PrivateRoute requiredRole="Student">
                        <StudentEnrollment />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/admin/dashboard"
                    element={
                      <PrivateRoute requiredRole="Admin">
                        <AdminDashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/students"
                    element={
                      <PrivateRoute requiredRole="Admin">
                        <StudentList />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/students/edit"
                    element={
                      <PrivateRoute requiredRole="Admin">
                        <EditStudentList />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/courses"
                    element={
                      <PrivateRoute requiredRole="Admin">
                        <AdminCourseView />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/attendance"
                    element={
                      <PrivateRoute requiredRole="Admin">
                        <AdminAttendance />
                      </PrivateRoute>
                    }
                  />

                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
                <ToastContainer
                  position="top-right"
                  autoClose={4000}
                  hideProgressBar={false}
                  newestOnTop={true}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </div>
            </div>
          )}
        </AuthContext.Consumer>
      </AuthProvider>
    </Router>
  );
}
export default App;