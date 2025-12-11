import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('PENDING');
  const [rejectModal, setRejectModal] = useState({ show: false, bookingId: null });
  const [rejectReason, setRejectReason] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      navigate('/');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getOwnerBookings();
      setBookings(response.data);
    } catch {
      setError('Không thể tải danh sách đặt sân');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    if (!window.confirm('Xác nhận đơn đặt sân này?')) return;

    try {
      await bookingAPI.confirm(id);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xác nhận đơn');
    }
  };

  const handleReject = async () => {
    try {
      await bookingAPI.reject(rejectModal.bookingId, rejectReason);
      setRejectModal({ show: false, bookingId: null });
      setRejectReason('');
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể từ chối đơn');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ xác nhận', color: '#f39c12', icon: '⏳' };
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', color: '#27ae60', icon: '✓' };
      case 'REJECTED':
        return { label: 'Đã từ chối', color: '#e74c3c', icon: '✕' };
      case 'CANCELLED':
        return { label: 'Khách hủy', color: '#95a5a6', icon: '⊘' };
      case 'COMPLETED':
        return { label: 'Hoàn thành', color: '#3498db', icon: '★' };
      default:
        return { label: status, color: '#7f8c8d', icon: '?' };
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return <div style={styles.loading}>Đang tải...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📋 Quản lý đơn đặt sân</h1>

      {error && <div style={styles.error}>{error}</div>}

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <div style={{...styles.statCard, borderColor: '#f39c12'}}>
          <span style={styles.statNumber}>{bookings.filter(b => b.status === 'PENDING').length}</span>
          <span style={styles.statLabel}>Chờ xác nhận</span>
        </div>
        <div style={{...styles.statCard, borderColor: '#27ae60'}}>
          <span style={styles.statNumber}>{bookings.filter(b => b.status === 'CONFIRMED').length}</span>
          <span style={styles.statLabel}>Đã xác nhận</span>
        </div>
        <div style={{...styles.statCard, borderColor: '#e74c3c'}}>
          <span style={styles.statNumber}>{bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED').length}</span>
          <span style={styles.statLabel}>Hủy/Từ chối</span>
        </div>
        <div style={{...styles.statCard, borderColor: '#3498db'}}>
          <span style={styles.statNumber}>{bookings.length}</span>
          <span style={styles.statLabel}>Tổng đơn</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterContainer}>
        <button
          onClick={() => setFilter('PENDING')}
          style={{
            ...styles.filterBtn,
            ...(filter === 'PENDING' ? styles.filterBtnPending : {}),
          }}
        >
          ⏳ Chờ duyệt ({bookings.filter(b => b.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('CONFIRMED')}
          style={{
            ...styles.filterBtn,
            ...(filter === 'CONFIRMED' ? styles.filterBtnConfirmed : {}),
          }}
        >
          ✓ Đã xác nhận ({bookings.filter(b => b.status === 'CONFIRMED').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          style={{
            ...styles.filterBtn,
            ...(filter === 'all' ? styles.filterBtnAll : {}),
          }}
        >
          📋 Tất cả ({bookings.length})
        </button>
      </div>

      {/* Bookings Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Khách hàng</th>
              <th style={styles.th}>Sân</th>
              <th style={styles.th}>Ngày</th>
              <th style={styles.th}>Giờ</th>
              <th style={styles.th}>Tổng tiền</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.noData}>
                  Không có đơn đặt sân nào
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => {
                const statusInfo = getStatusInfo(booking.status);
                return (
                  <tr key={booking.id} style={styles.tableRow}>
                    <td style={styles.td}>#{booking.id}</td>
                    <td style={styles.td}>
                      <strong>{booking.userName}</strong>
                      <br />
                      <span style={styles.phone}>📞 {booking.phoneNumber}</span>
                    </td>
                    <td style={styles.td}>
                      {booking.pitchName}
                      <br />
                      <span style={styles.pitchType}>{booking.pitchType.replace('PITCH_', 'Sân ')}</span>
                    </td>
                    <td style={styles.td}>{formatDate(booking.bookingDate)}</td>
                    <td style={styles.td}>
                      <strong>{booking.startTime} - {booking.endTime}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.price}>{formatPrice(booking.totalPrice)}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusInfo.color,
                      }}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {booking.status === 'PENDING' && (
                        <div style={styles.actions}>
                          <button
                            onClick={() => handleConfirm(booking.id)}
                            style={styles.confirmBtn}
                          >
                            ✓ Xác nhận
                          </button>
                          <button
                            onClick={() => setRejectModal({ show: true, bookingId: booking.id })}
                            style={styles.rejectBtn}
                          >
                            ✕ Từ chối
                          </button>
                        </div>
                      )}
                      {booking.status !== 'PENDING' && (
                        <span style={styles.noAction}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModal.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Từ chối đơn đặt sân</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối (không bắt buộc)..."
              style={styles.modalTextarea}
            />
            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setRejectModal({ show: false, bookingId: null });
                  setRejectReason('');
                }}
                style={styles.modalCancelBtn}
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                style={styles.modalConfirmBtn}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1rem',
    marginTop: '60px',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#7f8c8d',
    marginTop: '60px',
  },
  title: {
    fontSize: '2rem',
    color: '#2c3e50',
    marginBottom: '2rem',
  },
  error: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid',
  },
  statNumber: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2c3e50',
  },
  statLabel: {
    color: '#7f8c8d',
    fontSize: '0.9rem',
  },
  filterContainer: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  filterBtn: {
    padding: '0.75rem 1.25rem',
    border: '2px solid #ddd',
    backgroundColor: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.3s',
  },
  filterBtnPending: {
    backgroundColor: '#f39c12',
    color: 'white',
    borderColor: '#f39c12',
  },
  filterBtnConfirmed: {
    backgroundColor: '#27ae60',
    color: 'white',
    borderColor: '#27ae60',
  },
  filterBtnAll: {
    backgroundColor: '#3498db',
    color: 'white',
    borderColor: '#3498db',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#34495e',
    color: 'white',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  tableRow: {
    borderBottom: '1px solid #ecf0f1',
  },
  td: {
    padding: '1rem',
    verticalAlign: 'middle',
  },
  noData: {
    textAlign: 'center',
    padding: '3rem',
    color: '#7f8c8d',
  },
  phone: {
    color: '#7f8c8d',
    fontSize: '0.85rem',
  },
  pitchType: {
    color: '#7f8c8d',
    fontSize: '0.85rem',
  },
  price: {
    color: '#e74c3c',
    fontWeight: '700',
  },
  statusBadge: {
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  confirmBtn: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  rejectBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  noAction: {
    color: '#bdc3c7',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    fontSize: '1.25rem',
    color: '#2c3e50',
    marginBottom: '1rem',
  },
  modalTextarea: {
    width: '100%',
    minHeight: '100px',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical',
    marginBottom: '1rem',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  modalCancelBtn: {
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalConfirmBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default OwnerBookings;
