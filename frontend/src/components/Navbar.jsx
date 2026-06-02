import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowAccountMenu(false);
    logout();
    navigate('/login');
  };

  const getTheme = () => {
    if (!user) {
      return {
        gradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
        accent: '#FFD700',
        shadow: '0 4px 20px rgba(27, 94, 32, 0.28)',
      };
    }

    if (user.role === 'USER') {
      return {
        gradient: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
        accent: '#bef264',
        shadow: '0 4px 20px rgba(20, 83, 45, 0.28)',
      };
    }

    if (user.role === 'OWNER') {
      return {
        gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
        accent: '#99f6e4',
        shadow: '0 4px 20px rgba(15, 118, 110, 0.28)',
      };
    }

    return {
      gradient: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)',
      accent: '#fecaca',
      shadow: '0 4px 20px rgba(127, 29, 29, 0.28)',
    };
  };

  const theme = getTheme();

  const roleLabel = user?.role === 'OWNER'
    ? 'Chủ Sân'
    : user?.role === 'ADMIN'
      ? 'Quản Trị'
      : 'Người Dùng';

  const roleHomePath = user
    ? (user.role === 'USER' ? '/user/home' : user.role === 'OWNER' ? '/owner/home' : '/admin/home')
    : '/discover';

  const mainNavLabel = user ? 'Bảng điều khiển' : 'Trang chủ';

  const roleDescription = user?.role === 'OWNER'
    ? 'Quản lý sân'
    : user?.role === 'ADMIN'
      ? 'Quản trị toàn hệ thống'
      : 'Đặt sân';

  const isCompact = windowWidth < 1500;
  const showGeneralLinks = !user || !isCompact;

  return (
    <nav style={{ ...styles.nav, background: theme.gradient, boxShadow: theme.shadow }}>
      <div style={styles.container}>
        <Link to={roleHomePath} style={styles.logo}>
          <span style={styles.logoIcon}>⚽</span>
          <span style={styles.logoText}>ĐặtSân</span>
          <span style={styles.logoPro}>247</span>
        </Link>

        {user && !isCompact && (
          <div style={{ ...styles.roleBadge, borderColor: theme.accent, color: theme.accent }}>
            <span style={styles.roleBadgeTitle}>Vai trò: {roleLabel}</span>
            <span style={styles.roleBadgeSubtitle}>{roleDescription}</span>
          </div>
        )}
        
        <div style={styles.menu}>
          <Link to={user ? roleHomePath : '/discover'} style={styles.link}>
            <span style={styles.linkIcon}>🏠</span> {mainNavLabel}
          </Link>

          {showGeneralLinks && (
            <Link to="/discover" style={styles.link}>
              <span style={styles.linkIcon}>🔎</span> Khám phá sân
            </Link>
          )}

          {showGeneralLinks && (
            <Link to="/news" style={styles.link}>
              <span style={styles.linkIcon}>📰</span> Tin bóng đá
            </Link>
          )}
          
          {user ? (
            <>
              {user.role === 'USER' && (
                <>
                  <Link to="/my-bookings" style={styles.link}>
                    <span style={styles.linkIcon}>📅</span> Lịch đặt
                  </Link>
                  <Link to="/chat" style={styles.link}>
                    <span style={styles.linkIcon}>💬</span> Chat
                  </Link>
                </>
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
                  <Link to="/chat" style={styles.link}>
                    <span style={styles.linkIcon}>💬</span> Chat
                  </Link>
                </>
              )}
              {user.role === 'ADMIN' && (
                <>
                  <Link to="/admin/pitches" style={styles.link}>
                    <span style={styles.linkIcon}>✅</span> Duyệt sân
                  </Link>
                  <Link to="/admin/users" style={styles.link}>
                    <span style={styles.linkIcon}>👥</span> Quản lý
                  </Link>
                </>
              )}
              <div style={styles.accountMenuWrap} ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowAccountMenu((prev) => !prev)}
                  style={styles.accountBtn}
                >
                  <div style={{ ...styles.avatar, color: '#1f2937', backgroundColor: theme.accent }}>
                    {user.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <span style={styles.profileName}>{isCompact ? 'Tài khoản' : user.fullName}</span>
                  <span style={styles.accountCaret}>▾</span>
                </button>

                {showAccountMenu && (
                  <div style={styles.accountDropdown}>
                    <Link
                      to="/profile"
                      style={styles.accountDropdownItem}
                      onClick={() => setShowAccountMenu(false)}
                    >
                      👤 Hồ sơ
                    </Link>
                    <button type="button" onClick={handleLogout} style={styles.accountDropdownLogout}>
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
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
    padding: '0.7rem 0',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1320px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
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
  roleBadge: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    border: '1px solid',
    borderRadius: '999px',
    padding: '0.35rem 0.75rem',
    backgroundColor: 'rgba(255,255,255,0.08)',
    minWidth: '170px',
    maxWidth: '210px',
  },
  roleBadgeTitle: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: '700',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  roleBadgeSubtitle: {
    display: 'block',
    fontSize: '0.73rem',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  menu: {
    display: 'flex',
    gap: '0.45rem',
    alignItems: 'center',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },
  link: {
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.44rem 0.68rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.89rem',
    backgroundColor: 'rgba(255,255,255,0.04)',
    whiteSpace: 'nowrap',
  },
  linkIcon: {
    fontSize: '1rem',
  },
  accountMenuWrap: {
    position: 'relative',
  },
  accountBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: 'rgba(255,255,255,0.96)',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    outline: 'none',
    fontWeight: '500',
    padding: '0.35rem 0.82rem 0.35rem 0.35rem',
    borderRadius: '50px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    maxWidth: '170px',
    whiteSpace: 'nowrap',
  },
  profileName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  accountCaret: {
    fontSize: '0.78rem',
    opacity: 0.85,
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
  accountDropdown: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    minWidth: '180px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #dbeafe',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1100,
  },
  accountDropdownItem: {
    textDecoration: 'none',
    color: '#0f172a',
    fontWeight: '600',
    fontSize: '0.9rem',
    padding: '0.72rem 0.9rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  accountDropdownLogout: {
    border: 'none',
    backgroundColor: '#ffffff',
    color: '#b91c1c',
    fontWeight: '700',
    fontSize: '0.9rem',
    padding: '0.72rem 0.9rem',
    textAlign: 'left',
    cursor: 'pointer',
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
