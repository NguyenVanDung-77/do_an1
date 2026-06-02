import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const PaymentQR = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!bookingId) {
      setError('Thiếu mã đơn đặt sân');
      setLoading(false);
      return;
    }

    if (fetchedRef.current) {
      return;
    }

    fetchedRef.current = true;

    fetchQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const fetchQr = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.createVietQrPayment(bookingId);
      setPaymentInfo(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo mã VietQR');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransferred = async () => {
    try {
      setSubmitting(true);
      await paymentAPI.requestConfirmation(bookingId);
      alert('Đã gửi yêu cầu xác nhận thanh toán. Chủ sân/Admin sẽ kiểm tra và xác nhận.');
      navigate('/my-bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu xác nhận thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Đang tạo mã VietQR...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Thanh toán qua VietQR</h1>
      <p style={styles.subtitle}>Quét mã bằng ứng dụng ngân hàng để chuyển khoản đúng số tiền.</p>

      {error && <div style={styles.error}>{error}</div>}

      {paymentInfo && (
        <div style={styles.card}>
          <div style={styles.qrWrap}>
            <img src={paymentInfo.paymentUrl} alt="Mã VietQR thanh toán" style={styles.qrImage} />
          </div>

          <div style={styles.infoPanel}>
            <p style={styles.infoRow}><strong>Mã đơn:</strong> #{paymentInfo.bookingId}</p>
            <p style={styles.infoRow}><strong>Ngân hàng (BIN):</strong> {paymentInfo.bankBin}</p>
            <p style={styles.infoRow}><strong>Số tài khoản:</strong> {paymentInfo.accountNo}</p>
            <p style={styles.infoRow}><strong>Chủ tài khoản:</strong> {paymentInfo.accountName}</p>
            <p style={styles.infoRow}><strong>Nội dung CK:</strong> {paymentInfo.transferContent}</p>
            <p style={styles.note}>Lưu ý: vui lòng giữ nguyên nội dung chuyển khoản để hệ thống đối soát nhanh.</p>
          </div>

          <div style={styles.actions}>
            <button
              style={styles.primaryButton}
              onClick={handleConfirmTransferred}
              disabled={submitting}
            >
              {submitting ? 'Đang gửi xác nhận...' : 'Tôi đã chuyển khoản'}
            </button>
            <button
              style={styles.secondaryButton}
              onClick={() => navigate('/my-bookings')}
            >
              Quay lại đơn đặt sân
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '2rem 1rem',
    marginTop: '60px',
  },
  loading: {
    marginTop: '90px',
    textAlign: 'center',
    fontSize: '1.1rem',
    color: '#1a5f2a',
  },
  title: {
    margin: 0,
    color: '#1a5f2a',
    fontSize: '1.9rem',
    fontWeight: '800',
  },
  subtitle: {
    marginTop: '0.6rem',
    color: '#334155',
    marginBottom: '1.4rem',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '0.9rem 1rem',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #bbf7d0',
    borderRadius: '16px',
    boxShadow: '0 8px 26px rgba(0,0,0,0.08)',
    padding: '1.2rem',
  },
  qrWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.2rem',
  },
  qrImage: {
    width: '100%',
    maxWidth: '360px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  infoPanel: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem',
  },
  infoRow: {
    margin: '0.4rem 0',
    color: '#0f172a',
  },
  note: {
    marginTop: '0.8rem',
    color: '#64748b',
    fontSize: '0.9rem',
  },
  actions: {
    marginTop: '1rem',
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  primaryButton: {
    border: 'none',
    borderRadius: '10px',
    padding: '0.72rem 1.2rem',
    cursor: 'pointer',
    color: '#fff',
    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
    fontWeight: '700',
  },
  secondaryButton: {
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '0.72rem 1.2rem',
    cursor: 'pointer',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    fontWeight: '700',
  },
};

export default PaymentQR;
