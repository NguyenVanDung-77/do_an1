import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.title}>⚽ Đăng Nhập</h2>
        <p style={styles.subtitle}>Chào mừng bạn quay trở lại!</p>
        
        {error && <div style={styles.error}>⚠️ {error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p style={styles.footer}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={styles.link}>
            Đăng ký ngay
          </Link>
        </p>

        <div style={styles.testAccounts}>
          <p style={styles.testTitle}>Tài khoản test:</p>
          <p>👤 Owner: owner1 / 123456</p>
          <p>👤 User: user1 / 123456</p>
          <p>🔐 Admin: admin / admin123</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 60px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)',
    marginTop: '60px',
  },
  formCard: {
    backgroundColor: 'white',
    padding: '3rem',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(26, 95, 42, 0.15)',
    width: '100%',
    maxWidth: '450px',
    border: '1px solid rgba(26, 95, 42, 0.1)',
  },
  title: {
    fontSize: '2rem',
    color: '#1a5f2a',
    marginBottom: '0.5rem',
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#666',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    textAlign: 'center',
    border: '1px solid #fecaca',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '0.5rem',
    color: '#1a5f2a',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  input: {
    padding: '1rem',
    border: '2px solid #e8f5e9',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    padding: '1rem',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(26, 95, 42, 0.3)',
    marginTop: '0.5rem',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
    color: '#666',
    fontSize: '0.95rem',
  },
  link: {
    color: '#1a5f2a',
    textDecoration: 'none',
    fontWeight: '700',
  },
  testAccounts: {
    marginTop: '2rem',
    padding: '1.25rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    fontSize: '0.85rem',
    color: '#666',
    border: '1px solid #86efac',
  },
  testTitle: {
    fontWeight: '700',
    marginBottom: '0.75rem',
    color: '#1a5f2a',
    fontSize: '0.9rem',
  },
};

export default Login;
