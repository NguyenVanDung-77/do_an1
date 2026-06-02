import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pitchAPI } from '../services/api';
import SearchFilter from '../components/SearchFilter';

const Home = () => {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPitches();
  }, []);

  const fetchPitches = async () => {
    try {
      setLoading(true);
      const response = await pitchAPI.getAll();
      setPitches(response.data);
      setSearchPerformed(false);
    } catch {
      setPitches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filters) => {
    try {
      setLoading(true);
      const response = await pitchAPI.search(filters);
      setPitches(response.data);
      setSearchPerformed(true);
      // Scroll đến section kết quả
      document.getElementById('pitches-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Search error:', error);
      setPitches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    fetchPitches();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const getPitchTypeLabel = (type) => {
    const types = {
      'PITCH_5': 'Sân 5',
      'PITCH_7': 'Sân 7',
      'PITCH_11': 'Sân 11',
    };
    return types[type] || type;
  };

  if (loading) {
    return <div style={styles.loading}>Đang tải...</div>;
  }

  return (
    <div>
      {/* Hero Banner */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContainer}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>⚽ Nền tảng đặt sân #1 Việt Nam</div>
            <h1 style={styles.heroTitle}>
              Đặt Sân Bóng <span style={styles.heroHighlight}>Chuyên Nghiệp</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Tìm kiếm, so sánh và đặt sân bóng dễ dàng chỉ trong vài giây.
              <br />Hơn 1000+ sân bóng trên toàn quốc đang chờ bạn!
            </p>
            <div style={styles.heroButtons}>
              <button style={styles.primaryBtn} onClick={() => {
                document.getElementById('pitches-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                🔍 Tìm Sân Ngay
              </button>
              <button style={styles.secondaryBtn}>
                📖 Hướng Dẫn
              </button>
            </div>
            <div style={styles.heroStats}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>1000+</span>
                <span style={styles.statLabel}>Sân bóng</span>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>50K+</span>
                <span style={styles.statLabel}>Lượt đặt</span>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>99%</span>
                <span style={styles.statLabel}>Hài lòng</span>
              </div>
            </div>
          </div>
          <div style={styles.heroImageWrapper}>
            <img 
              src="/wc26.jpg" 
              alt="Football Champion" 
              style={styles.heroImage}
            />
            <div style={styles.heroImageGlow}></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>🎯</div>
          <h3 style={styles.featureTitle}>Đặt Nhanh</h3>
          <p style={styles.featureDesc}>Chỉ 3 bước đơn giản để hoàn tất đặt sân</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>💰</div>
          <h3 style={styles.featureTitle}>Giá Tốt</h3>
          <p style={styles.featureDesc}>Cam kết giá tốt nhất thị trường</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>🛡️</div>
          <h3 style={styles.featureTitle}>An Toàn</h3>
          <p style={styles.featureDesc}>Đảm bảo quyền lợi khách hàng</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>⭐</div>
          <h3 style={styles.featureTitle}>Chất Lượng</h3>
          <p style={styles.featureDesc}>Sân bóng được đánh giá và kiểm duyệt</p>
        </div>
      </div>

      {/* Pitches Section */}
      <div style={styles.container} id="pitches-section">
        {/* Search Filter */}
        <SearchFilter onSearch={handleSearch} onReset={handleReset} />
        
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              {searchPerformed ? '🔍 Kết quả tìm kiếm' : '🏟️ Sân Bóng Nổi Bật'}
            </h2>
            <p style={styles.sectionSubtitle}>
              {searchPerformed ? `Tìm thấy ${pitches.length} sân phù hợp` : 'Khám phá những sân bóng tốt nhất'}
            </p>
          </div>
          {searchPerformed && (
            <button onClick={handleReset} style={styles.showAllBtn}>
              ← Xem tất cả
            </button>
          )}
        </div>
        
        {loading ? (
          <div style={styles.loadingInline}>
            <div style={styles.spinner}></div>
            <span>Đang tìm kiếm...</span>
          </div>
        ) : pitches.length === 0 ? (
          <div style={styles.noPitches}>
            <span style={styles.noPitchesIcon}>⚽</span>
            <h3>Không tìm thấy sân nào</h3>
            <p>Thử thay đổi bộ lọc hoặc xem tất cả sân có sẵn</p>
            <button onClick={handleReset} style={styles.resetSearchBtn}>
              Xem tất cả sân
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {pitches.map((pitch) => (
              <div key={pitch.id} style={styles.card}>
                <div style={styles.imageWrapper}>
                  <img
                    src={pitch.images || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800'}
                    alt={pitch.name}
                    style={styles.image}
                  />
                  <div style={styles.imageOverlay}></div>
                  <span style={styles.pitchTypeBadge}>
                    ⚽ {getPitchTypeLabel(pitch.type)}
                  </span>
                  <div style={styles.priceTag}>
                    {formatPrice(pitch.pricePerHour)}/h
                  </div>
                </div>
                <div style={styles.cardContent}>
                  <h3 style={styles.pitchName}>{pitch.name}</h3>
                  <div style={styles.pitchInfo}>
                    <p style={styles.pitchLocation}>
                      <span style={styles.infoIcon}>📍</span> {pitch.district}, {pitch.city}
                    </p>
                    <p style={styles.pitchTime}>
                      <span style={styles.infoIcon}>🕐</span> {pitch.openTime} - {pitch.closeTime}
                    </p>
                  </div>
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => navigate(`/pitch/${pitch.id}`)}
                      style={styles.detailBtn}
                    >
                      👁️ Chi tiết
                    </button>
                    <button
                      onClick={() => navigate(`/pitch/${pitch.id}`)}
                      style={styles.bookBtn}
                    >
                      ⚡ Đặt ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div style={styles.footerBrand}>
            <h2 style={styles.footerLogo}>⚽ ĐặtSân<span style={styles.footerLogoAccent}>247</span></h2>
            <p style={styles.footerTagline}>Nền tảng đặt sân bóng hàng đầu Việt Nam</p>
          </div>
          <div style={styles.footerLinks}>
            <div style={styles.footerColumn}>
              <h4 style={styles.footerTitle}>Về chúng tôi</h4>
              <ul style={styles.footerList}>
                <li>Giới thiệu</li>
                <li>Liên hệ</li>
                <li>Tuyển dụng</li>
              </ul>
            </div>
            <div style={styles.footerColumn}>
              <h4 style={styles.footerTitle}>Hỗ trợ</h4>
              <ul style={styles.footerList}>
                <li>Hướng dẫn đặt sân</li>
                <li>Câu hỏi thường gặp</li>
                <li>Điều khoản sử dụng</li>
              </ul>
            </div>
            <div style={styles.footerColumn}>
              <h4 style={styles.footerTitle}>Liên hệ</h4>
              <ul style={styles.footerList}>
                <li>📞 1900-xxxx</li>
                <li>📧 support@sanbong.pro</li>
                <li>📍 TP. Hồ Chí Minh</li>
              </ul>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2025 ĐặtSân247. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  // Hero Section - Football Field Theme
  hero: {
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 50%, #1a5f2a 100%)',
    padding: '4rem 2rem',
    marginTop: '60px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)',
    pointerEvents: 'none',
  },
  heroContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '3rem',
    position: 'relative',
    zIndex: 1,
    flexWrap: 'wrap',
  },
  heroContent: {
    flex: '1',
    minWidth: '300px',
    textAlign: 'left',
  },
  heroImageWrapper: {
    flex: '0 0 auto',
    position: 'relative',
  },
  heroImage: {
    width: '350px',
    height: '350px',
    objectFit: 'cover',
    borderRadius: '20px',
    border: '4px solid rgba(255,255,255,0.3)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    transition: 'transform 0.3s ease',
  },
  heroImageGlow: {
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    right: '-10px',
    bottom: '-10px',
    background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)',
    borderRadius: '30px',
    zIndex: -1,
  },
  heroBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fbbf24',
    padding: '0.5rem 1.25rem',
    borderRadius: '25px',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  heroTitle: {
    fontSize: '3rem',
    color: '#ffffff',
    marginBottom: '1rem',
    fontWeight: '700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    lineHeight: '1.2',
  },
  heroHighlight: {
    color: '#fbbf24',
    display: 'block',
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '2.5rem',
    lineHeight: '1.7',
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: '2rem',
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#0f3d1a',
    border: 'none',
    padding: '1rem 2.5rem',
    borderRadius: '50px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '2px solid rgba(255,255,255,0.5)',
    padding: '1rem 2.5rem',
    borderRadius: '50px',
    fontSize: '1.05rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  statItem: {
    textAlign: 'center',
  },
  statNumber: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fbbf24',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: '1px',
    height: '40px',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // Features Section
  featuresSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1200px',
    margin: '-3rem auto 0',
    padding: '0 2rem',
    position: 'relative',
    zIndex: 2,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: '2rem 1.5rem',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '1px solid rgba(26, 95, 42, 0.1)',
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.1rem',
    color: '#1a5f2a',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  featureDesc: {
    fontSize: '0.9rem',
    color: '#666',
    margin: 0,
  },

  // Container
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '4rem 2rem',
  },

  // Section Header
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    color: '#1a5f2a',
    fontWeight: '700',
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: '0.95rem',
    color: '#666',
    marginTop: '0.5rem',
  },
  showAllBtn: {
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.25rem',
    borderRadius: '25px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // Loading & Empty States
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#7f8c8d',
    marginTop: '60px',
  },
  loadingInline: {
    textAlign: 'center',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e8f5e9',
    borderTop: '4px solid #1a5f2a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  noPitches: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '16px',
    border: '2px dashed #86efac',
  },
  noPitchesIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem',
  },
  resetSearchBtn: {
    marginTop: '1.5rem',
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    border: 'none',
    padding: '0.875rem 2rem',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // Pitch Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
  },

  // Pitch Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '1px solid rgba(26, 95, 42, 0.1)',
  },
  imageWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
    pointerEvents: 'none',
  },
  pitchTypeBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  priceTag: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    backgroundColor: '#fbbf24',
    color: '#0f3d1a',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '700',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  cardContent: {
    padding: '1.5rem',
  },
  pitchName: {
    fontSize: '1.25rem',
    color: '#1a5f2a',
    marginBottom: '1rem',
    fontWeight: '700',
  },
  pitchInfo: {
    marginBottom: '1.25rem',
  },
  pitchLocation: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  pitchTime: {
    fontSize: '0.9rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  infoIcon: {
    fontSize: '1rem',
  },
  cardActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  detailBtn: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    color: '#1a5f2a',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  bookBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(26, 95, 42, 0.3)',
  },

  // Footer
  footer: {
    background: 'linear-gradient(135deg, #0f3d1a 0%, #1a5f2a 100%)',
    color: 'white',
    marginTop: '4rem',
  },
  footerTop: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '3rem',
    padding: '4rem 2rem 3rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  footerBrand: {
    flex: '1 1 300px',
  },
  footerLogo: {
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: 0,
    marginBottom: '0.75rem',
  },
  footerLogoAccent: {
    color: '#fbbf24',
  },
  footerTagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.95rem',
    margin: 0,
  },
  footerLinks: {
    display: 'flex',
    flex: '2 1 500px',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  footerColumn: {
    flex: '1 1 150px',
  },
  footerTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#fbbf24',
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.9rem',
  },
  footerBottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '1.5rem 2rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
  },
};

export default Home;
