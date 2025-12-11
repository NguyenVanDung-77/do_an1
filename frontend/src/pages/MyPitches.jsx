import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pitchAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyPitches = () => {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPitch, setEditingPitch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    district: '',
    type: 'PITCH_5',
    pricePerHour: '',
    images: '',
    openTime: '06:00',
    closeTime: '22:00',
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      navigate('/');
      return;
    }
    fetchPitches();
  }, [user, navigate]);

  const fetchPitches = async () => {
    try {
      const response = await pitchAPI.getMyPitches();
      setPitches(response.data);
    } catch {
      setError('Không thể tải danh sách sân');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingPitch) {
        await pitchAPI.update(editingPitch.id, formData);
      } else {
        await pitchAPI.create(formData);
      }
      setShowForm(false);
      setEditingPitch(null);
      resetForm();
      fetchPitches();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (pitch) => {
    setEditingPitch(pitch);
    setFormData({
      name: pitch.name,
      description: pitch.description || '',
      address: pitch.address,
      city: pitch.city || '',
      district: pitch.district || '',
      type: pitch.type,
      pricePerHour: pitch.pricePerHour,
      images: pitch.images || '',
      openTime: pitch.openTime,
      closeTime: pitch.closeTime,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sân này?')) return;

    try {
      await pitchAPI.delete(id);
      fetchPitches();
    } catch {
      setError('Không thể xóa sân');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      district: '',
      type: 'PITCH_5',
      pricePerHour: '',
      images: '',
      openTime: '06:00',
      closeTime: '22:00',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPitch(null);
    resetForm();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return <div style={styles.loading}>Đang tải...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý sân của tôi</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={styles.addBtn}>
            + Thêm sân mới
          </button>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {editingPitch ? 'Sửa sân' : 'Thêm sân mới'}
          </h2>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tên sân *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Loại sân *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="PITCH_5">Sân 5 người</option>
                  <option value="PITCH_7">Sân 7 người</option>
                  <option value="PITCH_11">Sân 11 người</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{...styles.input, minHeight: '80px'}}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Địa chỉ *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Quận/Huyện</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Thành phố</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Giá/giờ (VNĐ) *</label>
                <input
                  type="number"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  min="0"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Link ảnh</label>
                <input
                  type="text"
                  name="images"
                  value={formData.images}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Giờ mở cửa *</label>
                <input
                  type="time"
                  name="openTime"
                  value={formData.openTime}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Giờ đóng cửa *</label>
                <input
                  type="time"
                  name="closeTime"
                  value={formData.closeTime}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.saveBtn}>
                {editingPitch ? 'Cập nhật' : 'Thêm sân'}
              </button>
              <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.pitchList}>
        {pitches.length === 0 ? (
          <p style={styles.noPitches}>Bạn chưa có sân nào</p>
        ) : (
          pitches.map((pitch) => (
            <div key={pitch.id} style={styles.pitchCard}>
              <div style={styles.pitchInfo}>
                <h3 style={styles.pitchName}>{pitch.name}</h3>
                <p style={styles.pitchType}>{pitch.type.replace('PITCH_', 'Sân ')} người</p>
                <p style={styles.pitchAddress}>📍 {pitch.address}</p>
                <p style={styles.pitchPrice}>💰 {formatPrice(pitch.pricePerHour)}/giờ</p>
                <p style={styles.pitchStatus}>
                  {pitch.isApproved ? (
                    <span style={{color: '#27ae60'}}>✓ Đã duyệt</span>
                  ) : (
                    <span style={{color: '#f39c12'}}>⏳ Chờ duyệt</span>
                  )}
                </p>
              </div>
              
              <div style={styles.pitchActions}>
                <button onClick={() => handleEdit(pitch)} style={styles.editBtn}>
                  ✏️ Sửa
                </button>
                <button onClick={() => handleDelete(pitch.id)} style={styles.deleteBtn}>
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#7f8c8d',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    color: '#2c3e50',
  },
  addBtn: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  },
  error: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  formCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  formTitle: {
    fontSize: '1.5rem',
    color: '#2c3e50',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '0.5rem',
    color: '#2c3e50',
    fontWeight: '500',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.875rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '0.875rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  pitchList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  noPitches: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '3rem',
    color: '#7f8c8d',
    fontSize: '1.1rem',
  },
  pitchCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  pitchInfo: {
    marginBottom: '1rem',
  },
  pitchName: {
    fontSize: '1.3rem',
    color: '#2c3e50',
    marginBottom: '0.5rem',
  },
  pitchType: {
    color: '#3498db',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  pitchAddress: {
    color: '#7f8c8d',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  },
  pitchPrice: {
    color: '#27ae60',
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  pitchStatus: {
    fontSize: '0.9rem',
  },
  pitchActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default MyPitches;
