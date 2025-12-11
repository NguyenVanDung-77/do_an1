import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>⚽</span>
          <span style={styles.logoText}>ĐặtSân</span>
          <span style={styles.logoPro}>247</span>
        </Link>
        
        <div style={styles.menu}>
          <Link to="/" style={styles.link}>
            <span style={styles.linkIcon}>🏠</span> Trang chủ
          </Link>
          
          {user ? (
            <>
              {user.role === 'USER' && (
                <Link to="/my-bookings" style={styles.link}>
                  <span style={styles.linkIcon}>📅</span> Lịch đặt
                </Link>
              )}
              {user.role === 'OWNER' && (
                <>
                  <Link to="/my-pitches" style={styles.link}>
                    <span style={styles.linkIcon}>🏟️</span> Sân của tôi
                  </Link>
                  <Link to="/owner/bookings" style={styles.link}>
                    <span style={styles.linkIcon}>📋</span> Đơn đặt
                  </Link>
                  <Link to="/owner/statistics" style={styles.link}>
                    <span style={styles.linkIcon}>📊</span> Thống kê
                  </Link>
                </>
              )}
              {user.role === 'ADMIN' && (
                <>
                  <Link to="/admin" style={styles.link}>
                    <span style={styles.linkIcon}>✅</span> Duyệt sân
                  </Link>
                  <Link to="/admin/users" style={styles.link}>
                    <span style={styles.linkIcon}>👥</span> Quản lý
                  </Link>
                </>
              )}
              <Link to="/profile" style={styles.profileLink}>
                <div style={styles.avatar}>{user.fullName?.charAt(0)?.toUpperCase()}</div>
                <span>{user.fullName}</span>
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                🚪 Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.loginBtn}>Đăng nhập</Link>
              <Link to="/register" style={styles.registerBtn}>
                ⚡ Đăng ký ngay
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
    padding: '0.75rem 0',
    boxShadow: '0 4px 20px rgba(27, 94, 32, 0.3)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  logoIcon: {
    fontSize: '2rem',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  },
  logoText: {
    color: 'white',
    letterSpacing: '-0.5px',
  },
  logoPro: {
    color: '#FFD700',
    fontStyle: 'italic',
    fontWeight: '800',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  menu: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  link: {
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.95rem',
  },
  linkIcon: {
    fontSize: '1rem',
  },
  profileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'white',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.4rem 1rem 0.4rem 0.4rem',
    borderRadius: '50px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#FFD700',
    color: '#1B5E20',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  loginBtn: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    border: '2px solid rgba(255,255,255,0.5)',
    transition: 'all 0.3s ease',
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)',
    transition: 'all 0.3s ease',
  },
  registerBtn: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
    color: '#1B5E20',
    padding: '0.6rem 1.5rem',
    borderRadius: '50px',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '700',
    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
    transition: 'all 0.3s ease',
  },
};

export default Navbar;
