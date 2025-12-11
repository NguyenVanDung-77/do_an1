import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Pitch APIs
export const pitchAPI = {
  getAll: () => api.get('/pitches'),
  getById: (id) => api.get(`/pitches/${id}`),
  create: (data) => api.post('/pitches', data),
  update: (id, data) => api.put(`/pitches/${id}`, data),
  delete: (id) => api.delete(`/pitches/${id}`),
  getMyPitches: () => api.get('/pitches/my-pitches'),
  getAllForAdmin: () => api.get('/pitches/admin/all'),
  approve: (id) => api.put(`/pitches/admin/${id}/approve`),
  
  // Tìm kiếm & Lọc
  search: (params) => api.get('/pitches/search', { params }),
  getCities: () => api.get('/pitches/cities'),
  getDistrictsByCity: (city) => api.get('/pitches/districts', { params: { city } }),
  getPriceRange: () => api.get('/pitches/price-range'),
};

// Booking APIs
export const bookingAPI = {
  // Lấy khung giờ còn trống
  getAvailableSlots: (pitchId, date) => api.get(`/bookings/available-slots/${pitchId}?date=${date}`),
  
  // Đặt sân
  create: (data) => api.post('/bookings', data),
  
  // Lấy đơn đặt của user
  getMyBookings: () => api.get('/bookings/my-bookings'),
  
  // Lấy chi tiết đơn
  getById: (id) => api.get(`/bookings/${id}`),
  
  // Hủy đơn (USER)
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  
  // OWNER APIs
  getOwnerBookings: () => api.get('/bookings/owner/all'),
  getPendingBookings: () => api.get('/bookings/owner/pending'),
  confirm: (id) => api.put(`/bookings/owner/${id}/confirm`),
  reject: (id, reason) => api.put(`/bookings/owner/${id}/reject`, { reason }),
};

// Review APIs
export const reviewAPI = {
  // Lấy reviews của sân
  getByPitchId: (pitchId) => api.get(`/reviews/pitch/${pitchId}`),
  
  // Lấy thông tin tổng hợp (rating trung bình, số lượng)
  getSummary: (pitchId) => api.get(`/reviews/pitch/${pitchId}/summary`),
  
  // Kiểm tra user đã review chưa
  checkUserReview: (pitchId) => api.get(`/reviews/pitch/${pitchId}/check`),
  
  // Tạo hoặc cập nhật review
  create: (data) => api.post('/reviews', data),
  
  // Xóa review của mình
  delete: (id) => api.delete(`/reviews/${id}`),
  
  // Admin xóa review
  adminDelete: (id) => api.delete(`/reviews/admin/${id}`),
};

// Statistics APIs
export const statisticsAPI = {
  // Thống kê cho Owner
  getOwnerStats: () => api.get('/statistics/owner'),
  
  // Thống kê cho Admin
  getAdminStats: () => api.get('/statistics/admin'),
};

// Admin APIs
export const adminAPI = {
  // Lấy danh sách tất cả users
  getAllUsers: () => api.get('/admin/users'),
  
  // Lấy users theo role
  getUsersByRole: (role) => api.get(`/admin/users/role/${role}`),
  
  // Lấy chi tiết user
  getUserById: (userId) => api.get(`/admin/users/${userId}`),
  
  // Khóa/Mở khóa tài khoản
  toggleUserStatus: (userId) => api.put(`/admin/users/${userId}/toggle-status`),
  
  // Thay đổi role
  changeUserRole: (userId, role) => api.put(`/admin/users/${userId}/change-role`, { role }),
  
  // Xóa user (soft delete)
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

// User APIs (Profile)
export const userAPI = {
  // Lấy thông tin profile
  getProfile: () => api.get('/user/profile'),
  
  // Cập nhật profile
  updateProfile: (data) => api.put('/user/profile', data),
  
  // Đổi mật khẩu
  changePassword: (data) => api.put('/user/change-password', data),
};

// Report APIs
export const reportAPI = {
  // Xuất Excel cho Owner
  exportExcel: () => api.get('/reports/owner/excel', { responseType: 'blob' }),
  
  // Xuất PDF cho Owner
  exportPdf: () => api.get('/reports/owner/pdf', { responseType: 'blob' }),
};

export default api;
