import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PitchDetail from './pages/PitchDetail';
import MyPitches from './pages/MyPitches';
import MyBookings from './pages/MyBookings';
import OwnerBookings from './pages/OwnerBookings';
import OwnerStatistics from './pages/OwnerStatistics';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';

// Protected Route component
const ProtectedRoute = ({ children, requiredRole, excludeRoles = [] }) => {
  const { user, loading } = useAuth();

  // Chờ load xong user từ localStorage
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role bị loại trừ
  if (excludeRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App content with routing
const AppContent = () => {
  return (
    <div style={styles.app}>
      <Navbar />
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pitch/:id" element={<PitchDetail />} />
          
          <Route
            path="/my-pitches"
            element={
              <ProtectedRoute requiredRole="OWNER">
                <MyPitches />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute excludeRoles={['OWNER', 'ADMIN']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/owner/bookings"
            element={
              <ProtectedRoute requiredRole="OWNER">
                <OwnerBookings />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/owner/statistics"
            element={
              <ProtectedRoute requiredRole="OWNER">
                <OwnerStatistics />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#ecf0f1',
  },
  main: {
    paddingTop: '70px', // Navbar height
  },
};

export default App
