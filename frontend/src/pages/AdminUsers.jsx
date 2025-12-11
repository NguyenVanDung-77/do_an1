import { useState, useEffect } from 'react';
import { adminAPI, statisticsAPI } from '../services/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, USER, OWNER
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        adminAPI.getAllUsers(),
        statisticsAPI.getAdminStats()
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await adminAPI.toggleUserStatus(userId);
      setUsers(users.map(u => u.id === userId ? response.data : u));
    } catch (err) {
      alert('Không thể thay đổi trạng thái: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Bạn có chắc muốn đổi role thành ${newRole}?`)) return;
    
    try {
      const response = await adminAPI.changeUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? response.data : u));
    } catch (err) {
      alert('Không thể thay đổi role: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>👑 Quản trị hệ thống</h1>

      {/* Admin Stats */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, ...styles.primaryCard }}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalUsers + stats.totalOwners}</div>
              <div style={styles.statLabel}>Người dùng</div>
            </div>
          </div>

          <div style={{ ...styles.statCard, ...styles.successCard }}>
            <div style={styles.statIcon}>🏟️</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalOwners}</div>
              <div style={styles.statLabel}>Chủ sân</div>
            </div>
          </div>

          <div style={{ ...styles.statCard, ...styles.infoCard }}>
            <div style={styles.statIcon}>⚽</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalPitches}</div>
              <div style={styles.statLabel}>Tổng sân</div>
            </div>
          </div>

          <div style={{ ...styles.statCard, ...styles.warningCard }}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</div>
              <div style={styles.statLabel}>Tổng doanh thu</div>
            </div>
          </div>
        </div>
      )}

      {/* Time Stats */}
      {stats && (
        <div style={styles.timeStatsRow}>
          <div style={styles.timeStatBox}>
            <span style={styles.timeStatTitle}>📅 Tháng này:</span>
            <span>{stats.thisMonthUsers} user mới • {stats.thisMonthBookings} đơn • {formatCurrency(stats.thisMonthRevenue)}</span>
          </div>
          <div style={styles.timeStatBox}>
            <span style={styles.timeStatTitle}>📆 Hôm nay:</span>
            <span>{stats.todayBookings} đơn • {formatCurrency(stats.todayRevenue)}</span>
          </div>
        </div>
      )}

      {/* User Management */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>👤 Quản lý người dùng</h2>

        {/* Filters */}
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <button 
              style={{...styles.filterBtn, ...(filter === 'all' ? styles.filterBtnActive : {})}}
              onClick={() => setFilter('all')}
            >
              Tất cả ({users.length})
            </button>
            <button 
              style={{...styles.filterBtn, ...(filter === 'USER' ? styles.filterBtnActive : {})}}
              onClick={() => setFilter('USER')}
            >
              Users ({users.filter(u => u.role === 'USER').length})
            </button>
            <button 
              style={{...styles.filterBtn, ...(filter === 'OWNER' ? styles.filterBtnActive : {})}}
              onClick={() => setFilter('OWNER')}
            >
              Owners ({users.filter(u => u.role === 'OWNER').length})
            </button>
          </div>

          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Users Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Thông tin</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Thống kê</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Ngày tạo</th>
                <th style={styles.th}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.emptyRow}>Không có người dùng nào</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td style={styles.td}>#{user.id}</td>
                    <td style={styles.td}>
                      <div style={styles.userInfo}>
                        <div style={styles.userName}>{user.fullName}</div>
                        <div style={styles.userEmail}>@{user.username}</div>
                        <div style={styles.userEmail}>{user.email}</div>
                        {user.phoneNumber && <div style={styles.userEmail}>📞 {user.phoneNumber}</div>}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.roleBadge,
                        backgroundColor: user.role === 'OWNER' ? '#8b5cf6' : '#3b82f6'
                      }}>
                        {user.role === 'OWNER' ? '🏟️ OWNER' : '👤 USER'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.statsInfo}>
                        <span>📅 {user.totalBookings} đặt sân</span>
                        {user.role === 'OWNER' && (
                          <span>⚽ {user.totalPitches} sân</span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: user.isActive ? '#10b981' : '#ef4444'
                      }}>
                        {user.isActive ? '✅ Hoạt động' : '🚫 Đã khóa'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.dateInfo}>{formatDate(user.createdAt)}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: user.isActive ? '#ef4444' : '#10b981'
                          }}
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.isActive ? '🔒 Khóa' : '🔓 Mở'}
                        </button>
                        
                        <select
                          style={styles.roleSelect}
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        >
                          <option value="USER">USER</option>
                          <option value="OWNER">OWNER</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#1f2937',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#6b7280',
  },
  error: {
    padding: '15px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    borderRadius: '8px',
    marginBottom: '20px',
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '12px',
    color: 'white',
  },
  primaryCard: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  successCard: { background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  infoCard: { background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
  warningCard: { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  statIcon: {
    fontSize: '32px',
    marginRight: '15px',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.9,
  },

  // Time Stats
  timeStatsRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  timeStatBox: {
    flex: 1,
    minWidth: '280px',
    backgroundColor: '#f3f4f6',
    padding: '15px 20px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  timeStatTitle: {
    fontWeight: '600',
    color: '#374151',
  },

  // Section
  section: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#1f2937',
  },

  // Filters
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  filterGroup: {
    display: 'flex',
    gap: '10px',
  },
  filterBtn: {
    padding: '8px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
  },
  searchInput: {
    padding: '10px 15px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    minWidth: '250px',
  },

  // Table
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #e5e7eb',
    color: '#6b7280',
    fontWeight: '600',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    color: '#374151',
    verticalAlign: 'top',
  },
  emptyRow: {
    textAlign: 'center',
    padding: '30px',
    color: '#6b7280',
  },

  // User Info
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  userName: {
    fontWeight: '600',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: '13px',
    color: '#6b7280',
  },

  // Badges
  roleBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '500',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '500',
  },

  // Stats Info
  statsInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '13px',
  },

  // Date
  dateInfo: {
    fontSize: '13px',
    color: '#6b7280',
  },

  // Actions
  actionBtns: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  actionBtn: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  roleSelect: {
    padding: '6px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
};

export default AdminUsers;
