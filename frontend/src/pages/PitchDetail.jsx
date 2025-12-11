import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pitchAPI, bookingAPI, reviewAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PitchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking states
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [userReviewStatus, setUserReviewStatus] = useState({ hasReviewed: false, canReview: false, review: null });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchPitch = useCallback(async () => {
    try {
      const response = await pitchAPI.getById(id);
      setPitch(response.data);
    } catch {
      setPitch(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPitch();
    fetchReviews();
    fetchReviewSummary();
  }, [fetchPitch]);

  useEffect(() => {
    if (user && id) {
      checkUserReviewStatus();
    }
  }, [user, id]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (selectedDate && id) {
      fetchTimeSlots();
    }
  }, [selectedDate, id]);

  const fetchTimeSlots = async () => {
    try {
      const response = await bookingAPI.getAvailableSlots(id, selectedDate);
      setTimeSlots(response.data);
      setSelectedSlot(null);
    } catch {
      setTimeSlots([]);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getByPitchId(id);
      setReviews(response.data);
    } catch {
      setReviews([]);
    }
  };

  const fetchReviewSummary = async () => {
    try {
      const response = await reviewAPI.getSummary(id);
      setReviewSummary(response.data);
    } catch {
      setReviewSummary({ averageRating: 0, totalReviews: 0 });
    }
  };

  const checkUserReviewStatus = async () => {
    try {
      const response = await reviewAPI.checkUserReview(id);
      setUserReviewStatus(response.data);
      if (response.data.review) {
        setReviewRating(response.data.review.rating);
        setReviewComment(response.data.review.comment || '');
      }
    } catch {
      setUserReviewStatus({ hasReviewed: false, canReview: false, review: null });
    }
  };

  const handleBookingClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowBookingForm(true);
    setBookingError('');
    setBookingSuccess('');
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setPhoneNumber(user.phoneNumber || '');
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      setBookingError('Vui lòng chọn khung giờ');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      await bookingAPI.create({
        pitchId: parseInt(id),
        bookingDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        phoneNumber: phoneNumber,
        note: note
      });
      
      setBookingSuccess('Đặt sân thành công! Vui lòng chờ chủ sân xác nhận.');
      setShowBookingForm(false);
      setSelectedSlot(null);
      setNote('');
      
      // Refresh time slots
      fetchTimeSlots();
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Đặt sân thất bại');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Review handlers
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError('');

    try {
      await reviewAPI.create({
        pitchId: parseInt(id),
        rating: reviewRating,
        comment: reviewComment
      });
      
      setShowReviewForm(false);
      fetchReviews();
      fetchReviewSummary();
      checkUserReviewStatus();
    } catch (err) {
      setReviewError(err.response?.data || 'Không thể gửi đánh giá');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    
    try {
      await reviewAPI.delete(reviewId);
      fetchReviews();
      fetchReviewSummary();
      checkUserReviewStatus();
      setReviewRating(5);
      setReviewComment('');
    } catch (err) {
      alert(err.response?.data || 'Không thể xóa đánh giá');
    }
  };

  const renderStars = (rating, interactive = false, onSelect = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={interactive ? () => onSelect(i) : undefined}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            color: i <= rating ? '#f1c40f' : '#ddd',
            fontSize: interactive ? '2rem' : '1.2rem',
            marginRight: '2px',
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return <div style={styles.loading}>Đang tải...</div>;
  }

  if (!pitch) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.error}>Không tìm thấy sân</div>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* Back Button */}
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← 
      </button>

      {/* Page Title */}
      <h1 style={styles.pageTitle}>Thông tin sân bóng</h1>

      {/* Success Message */}
      {bookingSuccess && (
        <div style={styles.successMsg}>{bookingSuccess}</div>
      )}

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left: Image */}
        <div style={styles.imageSection}>
          <img
            src={pitch.images || 'https://picsum.photos/800/600'}
            alt={pitch.name}
            style={styles.pitchImage}
          />
        </div>

        {/* Right: Info Box */}
        <div style={styles.infoBox}>
          <h2 style={styles.infoTitle}>Thông tin chi tiết</h2>
          <div style={styles.infoContent}>
            <p><strong>Tên sân:</strong> {pitch.name}</p>
            <p><strong>Loại sân:</strong> {pitch.type.replace('PITCH_', 'Sân ')}</p>
            <p><strong>Chủ sân:</strong> {pitch.ownerName}</p>
            <p><strong>Địa chỉ:</strong> {pitch.address}, {pitch.district}, {pitch.city}</p>
            <p><strong>Giờ mở cửa:</strong> {pitch.openTime} - {pitch.closeTime}</p>
            <p><strong>Giá:</strong> <span style={styles.price}>{formatPrice(pitch.pricePerHour)}/giờ</span></p>
            
            {!showBookingForm ? (
              <button style={styles.bookBtn} onClick={handleBookingClick}>
                🎯 Đặt sân ngay
              </button>
            ) : (
              <button 
                style={{...styles.bookBtn, backgroundColor: '#95a5a6'}} 
                onClick={() => setShowBookingForm(false)}
              >
                ✕ Đóng form đặt sân
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Booking Form */}
      {showBookingForm && (
        <div style={styles.bookingSection}>
          <h2 style={styles.bookingSectionTitle}>📅 Đặt sân</h2>
          
          {bookingError && (
            <div style={styles.errorMsg}>{bookingError}</div>
          )}
          
          <form onSubmit={handleSubmitBooking}>
            {/* Date Selection */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Chọn ngày:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                style={styles.dateInput}
                required
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Chọn khung giờ:</label>
                {timeSlots.length === 0 ? (
                  <p style={styles.noSlots}>Đang tải khung giờ...</p>
                ) : (
                  <div style={styles.slotsGrid}>
                    {timeSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        disabled={slot.isBooked}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          ...styles.slotBtn,
                          ...(slot.isBooked ? styles.slotBooked : {}),
                          ...(selectedSlot?.startTime === slot.startTime ? styles.slotSelected : {}),
                        }}
                      >
                        {slot.startTime} - {slot.endTime}
                        {slot.isBooked && <span style={styles.bookedLabel}>Đã đặt</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Phone Number */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Số điện thoại liên hệ:</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Nhập số điện thoại"
                style={styles.input}
                required
              />
            </div>

            {/* Note */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Ghi chú (tùy chọn):</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Cần thêm áo phân biệt..."
                style={styles.textarea}
              />
            </div>

            {/* Summary */}
            {selectedSlot && (
              <div style={styles.summary}>
                <h4>📋 Tóm tắt đặt sân:</h4>
                <p><strong>Sân:</strong> {pitch.name}</p>
                <p><strong>Ngày:</strong> {new Date(selectedDate).toLocaleDateString('vi-VN')}</p>
                <p><strong>Giờ:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}</p>
                <p><strong>Tổng tiền:</strong> <span style={styles.totalPrice}>{formatPrice(selectedSlot.price)}</span></p>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              style={styles.submitBtn}
              disabled={bookingLoading || !selectedSlot}
            >
              {bookingLoading ? 'Đang xử lý...' : '✓ Xác nhận đặt sân'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews Section */}
      <div style={styles.reviewsSection}>
        <div style={styles.reviewsHeader}>
          <div>
            <h2 style={styles.reviewsTitle}>⭐ Đánh giá & Bình luận</h2>
            <div style={styles.ratingOverview}>
              <span style={styles.avgRating}>{reviewSummary.averageRating}</span>
              <span style={styles.starsDisplay}>{renderStars(Math.round(reviewSummary.averageRating))}</span>
              <span style={styles.totalReviews}>({reviewSummary.totalReviews} đánh giá)</span>
            </div>
          </div>
          
          {user && userReviewStatus.canReview && (
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              style={styles.writeReviewBtn}
            >
              {userReviewStatus.hasReviewed ? '✏️ Sửa đánh giá' : '✍️ Viết đánh giá'}
            </button>
          )}
          
          {user && !userReviewStatus.canReview && (
            <p style={styles.cannotReview}>
              💡 Bạn cần đặt sân và được xác nhận để có thể đánh giá
            </p>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div style={styles.reviewForm}>
            <h3>{userReviewStatus.hasReviewed ? 'Cập nhật đánh giá' : 'Viết đánh giá mới'}</h3>
            
            {reviewError && <div style={styles.errorMsg}>{reviewError}</div>}
            
            <form onSubmit={handleSubmitReview}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Đánh giá của bạn:</label>
                <div style={styles.starRating}>
                  {renderStars(reviewRating, true, setReviewRating)}
                  <span style={styles.ratingText}>
                    {reviewRating === 1 && 'Rất tệ'}
                    {reviewRating === 2 && 'Tệ'}
                    {reviewRating === 3 && 'Bình thường'}
                    {reviewRating === 4 && 'Tốt'}
                    {reviewRating === 5 && 'Xuất sắc'}
                  </span>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Nhận xét (tùy chọn):</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sân này..."
                  style={styles.reviewTextarea}
                />
              </div>
              
              <div style={styles.reviewFormActions}>
                <button 
                  type="submit" 
                  style={styles.submitReviewBtn}
                  disabled={reviewLoading}
                >
                  {reviewLoading ? 'Đang gửi...' : (userReviewStatus.hasReviewed ? 'Cập nhật' : 'Gửi đánh giá')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowReviewForm(false)}
                  style={styles.cancelBtn}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div style={styles.reviewsList}>
          {reviews.length === 0 ? (
            <p style={styles.noReviews}>Chưa có đánh giá nào cho sân này</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div style={styles.reviewUser}>
                    <span style={styles.userAvatar}>👤</span>
                    <span style={styles.userName}>{review.userName}</span>
                  </div>
                  <div style={styles.reviewMeta}>
                    <span style={styles.reviewStars}>{renderStars(review.rating)}</span>
                    <span style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p style={styles.reviewComment}>{review.comment}</p>
                )}
                {user && user.id === review.userId && (
                  <button 
                    onClick={() => handleDeleteReview(review.id)}
                    style={styles.deleteReviewBtn}
                  >
                    🗑️ Xóa
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Section: 3 Columns */}
      <div style={styles.bottomSection}>
        <div style={styles.column}>
          <h3 style={styles.columnTitle}>Giới thiệu</h3>
          <p style={styles.columnText}>
            {pitch.description || 'Cung cấp các tiện ích thông minh giúp bạn tìm sân bãi và đặt sân một cách hiệu quả nhất.'}
          </p>
        </div>
        
        <div style={styles.column}>
          <h3 style={styles.columnTitle}>Thông tin</h3>
          <p style={styles.columnText}>
            Công ty cổ phần gmail
          </p>
        </div>
        
        <div style={styles.column}>
          <h3 style={styles.columnTitle}>Liên hệ</h3>
          <p style={styles.columnText}>
            912012901192
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    marginTop: '60px',
    padding: '2rem',
    maxWidth: '1200px',
    margin: '60px auto 0',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#7f8c8d',
    marginTop: '60px',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    textAlign: 'center',
    border: '1px solid #fecaca',
  },
  backBtn: {
    backgroundColor: '#f0fdf4',
    color: '#1a5f2a',
    border: 'none',
    padding: '0.6rem 1rem',
    cursor: 'pointer',
    fontSize: '1rem',
    marginBottom: '1rem',
    borderRadius: '10px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  pageTitle: {
    fontSize: '2rem',
    color: '#1a5f2a',
    marginBottom: '2rem',
    fontWeight: '700',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '2rem',
    marginBottom: '3rem',
  },
  imageSection: {
    width: '100%',
  },
  pitchImage: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(26, 95, 42, 0.15)',
  },
  infoBox: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid #86efac',
  },
  infoTitle: {
    fontSize: '1.4rem',
    color: '#1a5f2a',
    marginBottom: '1.25rem',
    fontWeight: '700',
  },
  infoContent: {
    fontSize: '0.95rem',
    color: '#333',
    lineHeight: '1.9',
  },
  price: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: '1.2rem',
  },
  bookBtn: {
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '1.5rem',
    width: '100%',
    boxShadow: '0 4px 15px rgba(26, 95, 42, 0.3)',
    transition: 'all 0.3s ease',
  },
  // Booking Form Styles
  bookingSection: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    marginBottom: '2rem',
    boxShadow: '0 10px 40px rgba(26, 95, 42, 0.1)',
    border: '1px solid rgba(26, 95, 42, 0.1)',
  },
  bookingSectionTitle: {
    fontSize: '1.5rem',
    color: '#1a5f2a',
    marginBottom: '1.5rem',
    fontWeight: '700',
  },
  successMsg: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    textAlign: 'center',
    border: '1px solid #86efac',
    fontWeight: '600',
  },
  errorMsg: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    border: '1px solid #fecaca',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.6rem',
    fontWeight: '600',
    color: '#1a5f2a',
    fontSize: '0.95rem',
  },
  dateInput: {
    padding: '0.875rem 1rem',
    border: '2px solid #e8f5e9',
    borderRadius: '10px',
    fontSize: '1rem',
    width: '100%',
    maxWidth: '250px',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  input: {
    padding: '0.875rem 1rem',
    border: '2px solid #e8f5e9',
    borderRadius: '10px',
    fontSize: '1rem',
    width: '100%',
    maxWidth: '300px',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  textarea: {
    padding: '0.875rem 1rem',
    border: '2px solid #e8f5e9',
    borderRadius: '10px',
    fontSize: '1rem',
    width: '100%',
    minHeight: '80px',
    resize: 'vertical',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '0.85rem',
  },
  slotBtn: {
    padding: '0.85rem',
    border: '2px solid #2d8a42',
    borderRadius: '12px',
    backgroundColor: 'white',
    color: '#1a5f2a',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  slotBooked: {
    border: '2px solid #d1d5db',
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  slotSelected: {
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    borderColor: '#1a5f2a',
    boxShadow: '0 4px 15px rgba(26, 95, 42, 0.3)',
  },
  bookedLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#dc2626',
    marginTop: '0.25rem',
  },
  noSlots: {
    color: '#1a5f2a',
    fontStyle: 'italic',
    padding: '1rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '10px',
  },
  summary: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid #86efac',
  },
  totalPrice: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: '1.25rem',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 4px 15px rgba(26, 95, 42, 0.3)',
    transition: 'all 0.3s ease',
  },
  bottomSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid #86efac',
  },
  column: {
    color: '#333',
  },
  columnTitle: {
    fontSize: '1.1rem',
    color: '#1a5f2a',
    marginBottom: '0.75rem',
    fontWeight: '700',
  },
  columnText: {
    fontSize: '0.9rem',
    lineHeight: '1.7',
    color: '#555',
  },
  // Review Styles
  reviewsSection: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    marginBottom: '2rem',
    boxShadow: '0 10px 40px rgba(26, 95, 42, 0.1)',
    border: '1px solid rgba(26, 95, 42, 0.1)',
  },
  reviewsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  reviewsTitle: {
    fontSize: '1.5rem',
    color: '#1a5f2a',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  ratingOverview: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  avgRating: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#f59e0b',
  },
  starsDisplay: {
    display: 'flex',
  },
  totalReviews: {
    color: '#666',
    fontSize: '0.9rem',
  },
  writeReviewBtn: {
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(26, 95, 42, 0.3)',
    transition: 'all 0.3s ease',
  },
  cannotReview: {
    color: '#666',
    fontSize: '0.85rem',
    fontStyle: 'italic',
    maxWidth: '300px',
    textAlign: 'right',
    backgroundColor: '#f0fdf4',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
  },
  reviewForm: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)',
    padding: '1.75rem',
    borderRadius: '14px',
    marginBottom: '1.5rem',
    border: '1px solid #86efac',
  },
  starRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  ratingText: {
    color: '#1a5f2a',
    fontSize: '1rem',
    fontWeight: '500',
  },
  reviewTextarea: {
    padding: '0.875rem 1rem',
    border: '2px solid #e8f5e9',
    borderRadius: '10px',
    fontSize: '1rem',
    width: '100%',
    minHeight: '100px',
    resize: 'vertical',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  reviewFormActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  submitReviewBtn: {
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  cancelBtn: {
    backgroundColor: '#f3f4f6',
    color: '#666',
    border: '1px solid #d1d5db',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  noReviews: {
    textAlign: 'center',
    color: '#1a5f2a',
    padding: '2rem',
    fontStyle: 'italic',
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
  },
  reviewCard: {
    backgroundColor: '#fafafa',
    padding: '1.5rem',
    borderRadius: '14px',
    border: '1px solid #e8f5e9',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  reviewUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  userAvatar: {
    fontSize: '1.5rem',
  },
  userName: {
    fontWeight: '600',
    color: '#1a5f2a',
  },
  reviewMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  reviewStars: {
    display: 'flex',
  },
  reviewDate: {
    color: '#666',
    fontSize: '0.85rem',
  },
  reviewComment: {
    color: '#555',
    lineHeight: '1.7',
    marginBottom: '0.5rem',
  },
  deleteReviewBtn: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '0.4rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
};

export default PitchDetail;
