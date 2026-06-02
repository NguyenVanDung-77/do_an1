import { useEffect, useState } from 'react';
import { newsAPI } from '../services/api';

const FootballNews = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [league, setLeague] = useState('all');

  const leagueOptions = [
    { value: 'all', label: 'Tất cả giải đấu' },
    { value: 'premier_league', label: 'Ngoại hạng Anh' },
    { value: 'champions_league', label: 'UEFA Champions League (C1)' },
    { value: 'la_liga', label: 'La Liga' },
    { value: 'serie_a', label: 'Serie A' },
    { value: 'bundesliga', label: 'Bundesliga' },
    { value: 'ligue_1', label: 'Ligue 1' },
    { value: 'v_league', label: 'V-League / Bóng đá Việt Nam' },
  ];

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await newsAPI.getFootballNews(league);
        setItems(response.data || []);
      } catch {
        setError('Không thể tải tin bóng đá. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [league]);

  const formatDate = (isoDate) => {
    if (!isoDate) return 'Không rõ thời gian';
    try {
      return new Date(isoDate).toLocaleString('vi-VN');
    } catch {
      return 'Không rõ thời gian';
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerCard}>
        <h1 style={styles.title}>📰 Tin Bóng Đá Mới Nhất</h1>
        <p style={styles.subtitle}>Tổng hợp tin từ nhiều nguồn thể thao để bạn cập nhật nhanh mỗi ngày.</p>
        <div style={styles.filterRow}>
          <label style={styles.filterLabel} htmlFor="league-filter">Lọc theo giải đấu:</label>
          <select
            id="league-filter"
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            style={styles.select}
          >
            {leagueOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div style={styles.info}>Đang tải tin tức...</div>}
      {error && <div style={styles.error}>{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div style={styles.info}>Hiện chưa có dữ liệu tin tức.</div>
      )}

      <div style={styles.grid}>
        {items.map((item, index) => (
          <article key={`${item.link}-${index}`} style={styles.card}>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} style={styles.image} />
            )}
            <div style={styles.content}>
              <div style={styles.metaRow}>
                <span style={styles.source}>{item.source || 'Nguồn tin'}</span>
                <span style={styles.date}>{formatDate(item.publishedAt)}</span>
              </div>
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.summary}>{item.summary || 'Không có mô tả ngắn.'}</p>
              <a href={item.link} target="_blank" rel="noreferrer" style={styles.readMore}>
                Đọc chi tiết ↗
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1.5rem 1rem 2rem',
  },
  headerCard: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.2rem',
  },
  title: {
    margin: 0,
    fontSize: '1.9rem',
  },
  subtitle: {
    marginTop: '0.6rem',
    opacity: 0.93,
  },
  filterRow: {
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontWeight: '700',
    fontSize: '0.92rem',
  },
  select: {
    border: '1px solid #334155',
    borderRadius: '10px',
    backgroundColor: '#0f172a',
    color: 'white',
    padding: '0.48rem 0.7rem',
    fontSize: '0.92rem',
  },
  info: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem',
    color: '#334155',
  },
  error: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem',
    color: '#b91c1c',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.07)',
    display: 'flex',
    flexDirection: 'column',
  },
  image: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: '0.95rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.5rem',
    fontSize: '0.78rem',
  },
  source: {
    color: '#0f766e',
    fontWeight: '700',
  },
  date: {
    color: '#64748b',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1rem',
    color: '#0f172a',
    lineHeight: 1.4,
  },
  summary: {
    margin: 0,
    color: '#475569',
    lineHeight: 1.5,
    fontSize: '0.92rem',
  },
  readMore: {
    marginTop: '0.3rem',
    color: '#1d4ed8',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
};

export default FootballNews;
