import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OwnerHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Trang Chủ Chủ Sân - {user?.fullName}</h1>
        <p style={styles.subtitle}>Không gian quản trị dành riêng cho Chủ sân</p>
      </div>

      <div style={styles.grid}>
        <button style={styles.card} onClick={() => navigate('/my-pitches')}>
          <h3 style={styles.cardTitle}>Quản lý sân</h3>
          <p style={styles.cardText}>Thêm, sửa, xóa và theo dõi trạng thái duyệt sân.</p>
        </button>

        <button style={styles.card} onClick={() => navigate('/owner/bookings')}>
          <h3 style={styles.cardTitle}>Xử lý đơn đặt</h3>
          <p style={styles.cardText}>Xác nhận hoặc từ chối các đơn đang chờ duyệt.</p>
        </button>

        <button style={styles.card} onClick={() => navigate('/owner/statistics')}>
          <h3 style={styles.cardTitle}>Thống kê doanh thu</h3>
          <p style={styles.cardText}>Xem doanh thu và xuất báo cáo Excel/PDF.</p>
        </button>

        <button style={styles.card} onClick={() => navigate('/discover')}>
          <h3 style={styles.cardTitle}>Xem giao diện khách hàng</h3>
          <p style={styles.cardText}>Kiểm tra danh sách sân công khai trên hệ thống.</p>
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
    background: 'linear-gradient(180deg, #ecfeff 0%, #ffffff 45%)',
    borderRadius: '18px',
  },
  hero: {
    background: 'linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)',
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
    border: '1px solid #67e8f9',
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '1.1rem',
    cursor: 'pointer',
    boxShadow: '0 10px 28px rgba(15, 118, 110, 0.09)',
  },
  cardTitle: {
    margin: 0,
    color: '#0f766e',
  },
  cardText: {
    marginTop: '0.5rem',
    color: '#475569',
  },
};

export default OwnerHome;
