import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile | password
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile form
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });

  // Password form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      setProfile({
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        phoneNumber: response.data.phoneNumber || ''
      });
    } catch {
      setMessage({ type: 'error', text: 'Không thể tải thông tin. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!profile.fullName.trim()) {
      setMessage({ type: 'error', text: 'Họ tên không được để trống' });
      return;
    }

    if (!profile.email.trim()) {
      setMessage({ type: 'error', text: 'Email không được để trống' });
      return;
    }

    try {
      setSaving(true);
      const response = await userAPI.updateProfile(profile);
      
      // Cập nhật context nếu fullName thay đổi
      if (user && response.data.fullName !== user.fullName) {
        const updatedUser = { ...user, fullName: response.data.fullName, email: response.data.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Reload để cập nhật context
        window.location.reload();
      }
      
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cập nhật thất bại' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!passwords.currentPassword) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại' });
      return;
    }

    if (!passwords.newPassword) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu mới' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận không khớp' });
      return;
    }

    try {
      setSaving(true);
      await userAPI.changePassword(passwords);
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Đổi mật khẩu thất bại' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>👤 Tài khoản của tôi</h1>

        {/* User Info */}
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={styles.userName}>{user?.fullName}</div>
            <div style={styles.userRole}>
              {user?.role === 'ADMIN' ? '👑 Admin' : user?.role === 'OWNER' ? '🏟️ Chủ sân' : '👤 Người dùng'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'profile' ? styles.tabActive : {}) }}
            onClick={() => { setActiveTab('profile'); setMessage({ type: '', text: '' }); }}
          >
            📝 Thông tin cá nhân
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'password' ? styles.tabActive : {}) }}
            onClick={() => { setActiveTab('password'); setMessage({ type: '', text: '' }); }}
          >
            🔒 Đổi mật khẩu
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div style={{
            ...styles.message,
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24'
          }}>
            {message.text}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tên đăng nhập</label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                style={{ ...styles.input, ...styles.inputDisabled }}
              />
              <small style={styles.hint}>Không thể thay đổi tên đăng nhập</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Họ và tên *</label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleProfileChange}
                style={styles.input}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                style={styles.input}
                placeholder="Nhập email"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Số điện thoại</label>
              <input
                type="text"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleProfileChange}
                style={styles.input}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <button type="submit" style={styles.submitBtn} disabled={saving}>
              {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mật khẩu hiện tại *</label>
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                style={styles.input}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mật khẩu mới *</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                style={styles.input}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                style={styles.input}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <button type="submit" style={styles.submitBtn} disabled={saving}>
              {saving ? 'Đang xử lý...' : '🔐 Đổi mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '30px 20px',
    marginTop: '60px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '35px',
    boxShadow: '0 10px 40px rgba(26, 95, 42, 0.1)',
    border: '1px solid rgba(26, 95, 42, 0.1)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '5px',
    color: '#1a5f2a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#666',
    textAlign: 'center',
    marginBottom: '25px',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    color: '#6b7280',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    borderRadius: '15px',
    marginBottom: '25px',
    border: '1px solid #86efac',
  },
  avatar: {
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(26, 95, 42, 0.3)',
  },
  userName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a5f2a',
  },
  userRole: {
    fontSize: '14px',
    color: '#2d8a42',
    fontWeight: '500',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    backgroundColor: '#f0fdf4',
    padding: '6px',
    borderRadius: '12px',
  },
  tab: {
    flex: 1,
    padding: '12px 15px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a5f2a',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(26, 95, 42, 0.3)',
  },
  message: {
    padding: '14px 18px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a5f2a',
  },
  input: {
    padding: '14px 16px',
    border: '2px solid #e8f5e9',
    borderRadius: '10px',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  hint: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  submitBtn: {
    padding: '16px',
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
    boxShadow: '0 4px 15px rgba(26, 95, 42, 0.3)',
  },
};

export default Profile;
