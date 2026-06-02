import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Xin chào {user?.fullName}</h1>
        <p style={styles.subtitle}>Không gian dành riêng cho Người dùng đặt sân</p>
      </div>

      <div style={styles.grid}>
        <button style={styles.card} onClick={() => navigate('/discover')}>
          <h3 style={styles.cardTitle}>Khám phá sân bóng</h3>
          <p style={styles.cardText}>Tìm sân theo địa điểm, giá và loại sân.</p>
        </button>

        <button style={styles.card} onClick={() => navigate('/my-bookings')}>
          <h3 style={styles.cardTitle}>Lịch đặt của tôi</h3>
          <p style={styles.cardText}>Theo dõi trạng thái các đơn đã đặt.</p>
        </button>

        <button style={styles.card} onClick={() => navigate('/profile')}>
          <h3 style={styles.cardTitle}>Thông tin tài khoản</h3>
          <p style={styles.cardText}>Cập nhật thông tin cá nhân và mật khẩu.</p>
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
    background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 45%)',
    borderRadius: '18px',
  },
  hero: {
    background: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)',
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
    border: '1px solid #86efac',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '1.1rem',
    cursor: 'pointer',
    boxShadow: '0 10px 28px rgba(22, 101, 52, 0.08)',
  },
  cardTitle: {
    margin: 0,
    color: '#166534',
  },
  cardText: {
    marginTop: '0.5rem',
    color: '#475569',
  },
};

export default UserHome;
