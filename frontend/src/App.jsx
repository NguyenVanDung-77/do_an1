import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UserHome from './pages/UserHome';
import OwnerHome from './pages/OwnerHome';
import AdminHome from './pages/AdminHome';
import Login from './pages/Login';
import Register from './pages/Register';
import PitchDetail from './pages/PitchDetail';
import FootballNews from './pages/FootballNews';
import PaymentQR from './pages/PaymentQR';
import ChatPage from './pages/ChatPage';
import MyPitches from './pages/MyPitches';
import MyBookings from './pages/MyBookings';
import OwnerBookings from './pages/OwnerBookings';
import OwnerStatistics from './pages/OwnerStatistics';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';

const getRoleHomePath = (role) => {
  if (role === 'USER') return '/user/home';
  if (role === 'OWNER') return '/owner/home';
  if (role === 'ADMIN') return '/admin/home';
  return '/discover';
};

const RoleBasedHome = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/discover" replace />;
  }

  return <Navigate to={getRoleHomePath(user.role)} replace />;
};

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
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
          <Route path="/" element={<RoleBasedHome />} />
          <Route path="/discover" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pitch/:id" element={<PitchDetail />} />
          <Route path="/news" element={<FootballNews />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/qr"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PaymentQR />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/home"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <UserHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/home"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/home"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminHome />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/my-pitches"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <MyPitches />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/owner/bookings"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerBookings />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/owner/statistics"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerStatistics />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/pitches"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/admin" element={<Navigate to="/admin/pitches" replace />} />
          
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
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
