import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import StudentRegistration from './pages/StudentRegistration';
import StudentProfile from './pages/StudentProfile';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import MentorSessions from './pages/MentorSessions';
import MentorStudents from './pages/MentorStudents';
import AttendanceRecords from './pages/AttendanceRecords';
import UnknownFaces from './pages/UnknownFaces';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<StudentRegistration />} />
            
            {/* Student Profile Wizard (Protected but no sidebar) */}
            <Route path="/student/profile" element={
               <ProtectedRoute roleRequired="student">
                  <StudentProfile />
               </ProtectedRoute>
            } />

            {/* Dashboard Routes (With Sidebar & Navbar) */}
            <Route path="/*" element={
              <div className="dashboard-layout">
                <Sidebar />
                <div className="main-content">
                  <Navbar />
                  <div className="content-inner">
                    <Routes>
                      {/* Mentor Routes */}
                      <Route path="/mentor/dashboard" element={<ProtectedRoute roleRequired="mentor"><MentorDashboard /></ProtectedRoute>} />
                      <Route path="/mentor/sessions" element={<ProtectedRoute roleRequired="mentor"><MentorSessions /></ProtectedRoute>} />
                      <Route path="/mentor/students" element={<ProtectedRoute roleRequired="mentor"><MentorStudents /></ProtectedRoute>} />
                      <Route path="/mentor/attendance" element={<ProtectedRoute roleRequired="mentor"><AttendanceRecords /></ProtectedRoute>} />
                      <Route path="/mentor/unknown-faces" element={<ProtectedRoute roleRequired="mentor"><UnknownFaces /></ProtectedRoute>} />

                      {/* Student Dashboard Route */}
                      <Route path="/student/dashboard" element={<ProtectedRoute roleRequired="student"><StudentDashboard /></ProtectedRoute>} />
                      
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
