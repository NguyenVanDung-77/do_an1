import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, paymentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [paymentByBookingId, setPaymentByBookingId] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      const bookingList = response.data || [];
      setBookings(bookingList);
      await fetchPaymentStatuses(bookingList);
    } catch {
      setError('Không thể tải danh sách đặt sân');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStatuses = async (bookingList) => {
    if (!bookingList.length) {
      setPaymentByBookingId({});
      return;
    }

    const targetBookings = bookingList.filter(
      (booking) => booking.status === 'PENDING' || booking.status === 'CONFIRMED'
    );

    if (!targetBookings.length) {
      setPaymentByBookingId({});
      return;
    }

    const statusMap = {};

    await Promise.all(
      targetBookings.map(async (booking) => {
        try {
          const response = await paymentAPI.getByBookingId(booking.id);
          statusMap[booking.id] = response.data;
        } catch {
          statusMap[booking.id] = {
            paymentStatus: 'UNPAID',
            provider: 'VIETQR',
          };
        }
      })
    );

    setPaymentByBookingId(statusMap);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn đặt sân này?')) return;

    try {
      await bookingAPI.cancel(id);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể hủy đơn');
    }
  };

  const handlePayVietQr = (bookingId) => {
    navigate(`/payment/qr?bookingId=${bookingId}`);
  };

  const getPaymentStatusInfo = (paymentStatus) => {
    switch (paymentStatus) {
      case 'PAID':
        return { label: 'Đã thanh toán', color: '#15803d', backgroundColor: '#dcfce7' };
      case 'PENDING':
        return { label: 'Đang chờ thanh toán', color: '#b45309', backgroundColor: '#fef3c7' };
      case 'FAILED':
        return { label: 'Thanh toán thất bại', color: '#b91c1c', backgroundColor: '#fee2e2' };
      default:
        return { label: 'Chưa thanh toán', color: '#475569', backgroundColor: '#e2e8f0' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
        return { label: 'Bị từ chối', color: '#e74c3c', icon: '✕' };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: '#95a5a6', icon: '⊘' };
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
      <h1 style={styles.title}>📋 Lịch đặt sân của tôi</h1>

      {error && <div style={styles.error}>{error}</div>}

      {/* Filter Tabs */}
      <div style={styles.filterContainer}>
        <button
          onClick={() => setFilter('all')}
          style={{
            ...styles.filterBtn,
            ...(filter === 'all' ? styles.filterBtnActive : {}),
          }}
        >
          Tất cả ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          style={{
            ...styles.filterBtn,
            ...(filter === 'PENDING' ? styles.filterBtnActive : {}),
          }}
        >
          Chờ xác nhận ({bookings.filter(b => b.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('CONFIRMED')}
          style={{
            ...styles.filterBtn,
            ...(filter === 'CONFIRMED' ? styles.filterBtnActive : {}),
          }}
        >
          Đã xác nhận ({bookings.filter(b => b.status === 'CONFIRMED').length})
        </button>
        <button
          onClick={() => setFilter('CANCELLED')}
          style={{
            ...styles.filterBtn,
            ...(filter === 'CANCELLED' ? styles.filterBtnActive : {}),
          }}
        >
          Đã hủy ({bookings.filter(b => b.status === 'CANCELLED').length})
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div style={styles.emptyState}>
          <p>🔍 Không có đơn đặt sân nào</p>
          <button onClick={() => navigate('/')} style={styles.browseBtn}>
            Tìm sân ngay
          </button>
        </div>
      ) : (
        <div style={styles.bookingsList}>
          {filteredBookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status);
            return (
              <div key={booking.id} style={styles.bookingCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.pitchName}>{booking.pitchName}</h3>
                    <p style={styles.pitchType}>{booking.pitchType.replace('PITCH_', 'Sân ')}</p>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: statusInfo.color,
                  }}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📅 Ngày:</span>
                    <span style={styles.infoValue}>{formatDate(booking.bookingDate)}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>🕐 Giờ:</span>
                    <span style={styles.infoValue}>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📍 Địa chỉ:</span>
                    <span style={styles.infoValue}>{booking.pitchAddress}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>👤 Chủ sân:</span>
                    <span style={styles.infoValue}>{booking.ownerName} - {booking.ownerPhone}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>💰 Tổng tiền:</span>
                    <span style={styles.priceValue}>{formatPrice(booking.totalPrice)}</span>
                  </div>

                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>💳 Thanh toán:</span>
                      <span
                        style={{
                          ...styles.paymentBadge,
                          color: getPaymentStatusInfo(paymentByBookingId[booking.id]?.paymentStatus).color,
                          backgroundColor: getPaymentStatusInfo(paymentByBookingId[booking.id]?.paymentStatus).backgroundColor,
                        }}
                      >
                        {getPaymentStatusInfo(paymentByBookingId[booking.id]?.paymentStatus).label}
                      </span>
                    </div>
                  )}
                  
                  {booking.note && (
                    <div style={styles.noteSection}>
                      <span style={styles.infoLabel}>📝 Ghi chú:</span>
                      <p style={styles.noteText}>{booking.note}</p>
                    </div>
                  )}

                  {booking.rejectReason && (
                    <div style={styles.rejectSection}>
                      <span style={styles.infoLabel}>❌ Lý do từ chối:</span>
                      <p style={styles.rejectText}>{booking.rejectReason}</p>
                    </div>
                  )}
                </div>

                <div style={styles.cardFooter}>
                  <button
                    onClick={() => navigate(`/pitch/${booking.pitchId}`)}
                    style={styles.viewBtn}
                  >
                    👁️ Xem sân
                  </button>

                  <button
                    onClick={() => navigate(`/chat?bookingId=${booking.id}`)}
                    style={styles.chatBtn}
                  >
                    💬 Chat chủ sân
                  </button>

                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') &&
                    paymentByBookingId[booking.id]?.paymentStatus !== 'PAID' && (
                      <button
                        onClick={() => handlePayVietQr(booking.id)}
                        style={styles.payBtn}
                      >
                        💳 Thanh toán VietQR
                      </button>
                    )}
                  
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      style={styles.cancelBtn}
                    >
                      ✕ Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem 1rem',
    marginTop: '60px',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#1a5f2a',
    marginTop: '60px',
  },
  title: {
    fontSize: '1.85rem',
    color: '#1a5f2a',
    fontWeight: '700',
    marginBottom: '2rem',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid #fecaca',
    fontWeight: '500',
  },
  filterContainer: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    backgroundColor: '#f0fdf4',
    padding: '0.75rem',
    borderRadius: '14px',
  },
  filterBtn: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1a5f2a',
    transition: 'all 0.3s ease',
  },
  filterBtnActive: {
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(26, 95, 42, 0.3)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(26, 95, 42, 0.1)',
    border: '1px solid rgba(26, 95, 42, 0.1)',
  },
  browseBtn: {
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    border: 'none',
    padding: '0.875rem 2rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '1.5rem',
    boxShadow: '0 4px 15px rgba(26, 95, 42, 0.3)',
    transition: 'all 0.3s ease',
  },
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(26, 95, 42, 0.08)',
    overflow: 'hidden',
    border: '1px solid rgba(26, 95, 42, 0.1)',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)',
    borderBottom: '1px solid #86efac',
  },
  pitchName: {
    fontSize: '1.3rem',
    color: '#1a5f2a',
    margin: 0,
    fontWeight: '700',
  },
  pitchType: {
    color: '#2d8a42',
    margin: '0.35rem 0 0 0',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  statusBadge: {
    color: 'white',
    padding: '0.5rem 1.25rem',
    borderRadius: '25px',
    fontSize: '0.85rem',
    fontWeight: '700',
    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  },
  cardBody: {
    padding: '1.5rem',
  },
  infoRow: {
    display: 'flex',
    marginBottom: '0.85rem',
    alignItems: 'center',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#1a5f2a',
    minWidth: '130px',
    fontSize: '0.9rem',
  },
  infoValue: {
    color: '#333',
    fontWeight: '500',
  },
  priceValue: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: '1.15rem',
  },
  paymentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.35rem 0.7rem',
    borderRadius: '999px',
    fontSize: '0.82rem',
    fontWeight: '700',
  },
  noteSection: {
    marginTop: '1.25rem',
    padding: '1rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '10px',
    border: '1px solid #86efac',
  },
  noteText: {
    margin: '0.5rem 0 0 0',
    color: '#1a5f2a',
  },
  rejectSection: {
    marginTop: '1.25rem',
    padding: '1rem',
    backgroundColor: '#fef2f2',
    borderRadius: '10px',
    borderLeft: '4px solid #dc2626',
  },
  rejectText: {
    margin: '0.5rem 0 0 0',
    color: '#dc2626',
    fontWeight: '500',
  },
  cardFooter: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    padding: '1.25rem 1.5rem',
    borderTop: '1px solid #e8f5e9',
    backgroundColor: '#fafafa',
  },
  viewBtn: {
    backgroundColor: '#e8f5e9',
    color: '#1a5f2a',
    border: 'none',
    padding: '0.6rem 1.25rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  cancelBtn: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '0.6rem 1.25rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  payBtn: {
    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.25rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  chatBtn: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    padding: '0.6rem 1.25rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
};

export default MyBookings;
