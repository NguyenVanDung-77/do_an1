import { useState, useEffect } from 'react';
import { pitchAPI } from '../services/api';

const SearchFilter = ({ onSearch, onReset }) => {
  const [filters, setFilters] = useState({
    keyword: '',
    city: '',
    district: '',
    type: '',
    minPrice: '',
    maxPrice: '',
  });
  
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [priceRange, setPriceRange] = useState({ minPrice: 0, maxPrice: 1000000 });
  const [isExpanded, setIsExpanded] = useState(false);

  // Load cities và price range khi component mount
  useEffect(() => {
    loadCities();
    loadPriceRange();
  }, []);

  // Load districts khi city thay đổi
  useEffect(() => {
    if (filters.city) {
      loadDistricts(filters.city);
    } else {
      setDistricts([]);
      setFilters(prev => ({ ...prev, district: '' }));
    }
  }, [filters.city]);

  const loadCities = async () => {
    try {
      const response = await pitchAPI.getCities();
      setCities(response.data);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadDistricts = async (city) => {
    try {
      const response = await pitchAPI.getDistrictsByCity(city);
      setDistricts(response.data);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const loadPriceRange = async () => {
    try {
      const response = await pitchAPI.getPriceRange();
      setPriceRange(response.data);
    } catch (error) {
      console.error('Error loading price range:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Chỉ gửi những filter có giá trị
    const activeFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== null) {
        activeFilters[key] = filters[key];
      }
    });
    onSearch(activeFilters);
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      city: '',
      district: '',
      type: '',
      minPrice: '',
      maxPrice: '',
    });
    onReset();
  };

  const pitchTypes = [
    { value: 'PITCH_5', label: 'Sân 5 người' },
    { value: 'PITCH_7', label: 'Sân 7 người' },
    { value: 'PITCH_11', label: 'Sân 11 người' },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSearch}>
        {/* Thanh tìm kiếm chính */}
        <div style={styles.mainSearch}>
          <div style={styles.searchInputWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleChange}
              placeholder="Tìm kiếm sân bóng theo tên..."
              style={styles.searchInput}
            />
          </div>
          
          <select
            name="city"
            value={filters.city}
            onChange={handleChange}
            style={styles.selectMain}
          >
            <option value="">📍 Tất cả thành phố</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            style={styles.selectMain}
          >
            <option value="">⚽ Loại sân</option>
            {pitchTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <button type="submit" style={styles.searchBtn}>
            Tìm kiếm
          </button>
          
          <button 
            type="button" 
            onClick={() => setIsExpanded(!isExpanded)}
            style={styles.expandBtn}
          >
            {isExpanded ? '▲ Thu gọn' : '▼ Lọc nâng cao'}
          </button>
        </div>

        {/* Bộ lọc nâng cao */}
        {isExpanded && (
          <div style={styles.advancedFilters}>
            <div style={styles.filterRow}>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Quận/Huyện</label>
                <select
                  name="district"
                  value={filters.district}
                  onChange={handleChange}
                  style={styles.select}
                  disabled={!filters.city}
                >
                  <option value="">Tất cả quận/huyện</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                {!filters.city && (
                  <span style={styles.hint}>Chọn thành phố trước</span>
                )}
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Giá từ</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleChange}
                  placeholder={formatPrice(priceRange.minPrice)}
                  style={styles.input}
                  min="0"
                  step="10000"
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Giá đến</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleChange}
                  placeholder={formatPrice(priceRange.maxPrice)}
                  style={styles.input}
                  min="0"
                  step="10000"
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>&nbsp;</label>
                <button type="button" onClick={handleReset} style={styles.resetBtn}>
                  🔄 Đặt lại
                </button>
              </div>
            </div>

            <div style={styles.priceHint}>
              💡 Khoảng giá trong hệ thống: {formatPrice(priceRange.minPrice)} - {formatPrice(priceRange.maxPrice)}/giờ
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '1.75rem',
    boxShadow: '0 10px 40px rgba(26, 95, 42, 0.1)',
    marginBottom: '2.5rem',
    border: '1px solid rgba(26, 95, 42, 0.1)',
  },
  mainSearch: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchInputWrapper: {
    flex: '2',
    minWidth: '250px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    fontSize: '1.2rem',
    zIndex: 1,
  },
  searchInput: {
    width: '100%',
    padding: '0.875rem 1rem 0.875rem 2.75rem',
    border: '2px solid #e8f5e9',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  selectMain: {
    flex: '1',
    minWidth: '150px',
    padding: '0.875rem 1rem',
    border: '2px solid #e8f5e9',
    borderRadius: '12px',
    fontSize: '1rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  searchBtn: {
    padding: '0.875rem 2rem',
    background: 'linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(26, 95, 42, 0.3)',
  },
  expandBtn: {
    padding: '0.875rem 1.25rem',
    backgroundColor: '#f0fdf4',
    color: '#1a5f2a',
    border: '2px solid #86efac',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  advancedFilters: {
    marginTop: '1.75rem',
    paddingTop: '1.75rem',
    borderTop: '2px solid #e8f5e9',
  },
  filterRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.25rem',
    alignItems: 'end',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1a5f2a',
  },
  select: {
    padding: '0.75rem 1rem',
    border: '2px solid #e8f5e9',
    borderRadius: '10px',
    fontSize: '0.95rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '2px solid #e8f5e9',
    borderRadius: '10px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  hint: {
    fontSize: '0.75rem',
    color: '#2d8a42',
    fontStyle: 'italic',
  },
  resetBtn: {
    padding: '0.75rem 1.25rem',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '2px solid #fecaca',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  priceHint: {
    marginTop: '1.25rem',
    fontSize: '0.9rem',
    color: '#2d8a42',
    textAlign: 'center',
    padding: '0.75rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '10px',
  },
};

export default SearchFilter;
