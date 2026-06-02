import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Bảng Điều Khiển Quản Trị - {user?.fullName}</h1>
        <p style={styles.subtitle}>Không gian quản trị hệ thống dành riêng cho Admin</p>
      </div>

      <div style={styles.grid}>
        <button style={styles.card} onClick={() => navigate('/admin/pitches')}>
          <h3 style={styles.cardTitle}>Duyệt sân</h3>
          <p style={styles.cardText}>Phê duyệt, xem và xóa các sân trên hệ thống.</p>
        </button>

        <button style={styles.card} onClick={() => navigate('/admin/users')}>
          <h3 style={styles.cardTitle}>Quản lý người dùng</h3>
          <p style={styles.cardText}>Khóa/mở khóa và chuyển vai trò USER/OWNER.</p>
        </button>

        <button style={styles.card} onClick={() => navigate('/discover')}>
          <h3 style={styles.cardTitle}>Kiểm tra giao diện công khai</h3>
          <p style={styles.cardText}>Xem trải nghiệm người dùng công khai trên hệ thống.</p>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem 1rem',
    background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 45%)',
    borderRadius: '18px',
  },
  hero: {
    background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
    borderRadius: '16px',
    color: 'white',
    padding: '2rem',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
  },
  subtitle: {
    marginTop: '0.5rem',
    opacity: 0.95,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '1rem',
  },
  card: {
    textAlign: 'left',
    border: '1px solid #fca5a5',
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '1.1rem',
    cursor: 'pointer',
    boxShadow: '0 10px 28px rgba(127, 29, 29, 0.1)',
  },
  cardTitle: {
    margin: 0,
    color: '#991b1b',
  },
  cardText: {
    marginTop: '0.5rem',
    color: '#475569',
  },
};

export default AdminHome;
