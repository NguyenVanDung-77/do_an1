# ⚽ ĐặtSân247 - Hệ Thống Đặt Sân Bóng Đá Thông Minh

<div align="center">
  <img src="frontend/public/rwc.png" alt="ĐặtSân247 Logo" width="200"/>
  <br/><br/>
  <strong>🏆 Nền tảng đặt sân bóng hàng đầu Việt Nam</strong>
  <br/>
  <em>Đặt sân dễ dàng • Quản lý thông minh • Hỗ trợ 24/7</em>
  <br/><br/>
  
  ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.11-brightgreen)
  ![React](https://img.shields.io/badge/React-19.2.0-blue)
  ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
  ![Java](https://img.shields.io/badge/Java-17-red)
</div>

---

## 📋 Giới thiệu

**ĐặtSân247** là ứng dụng web đặt sân bóng đá trực tuyến, kết nối người chơi bóng với chủ sân một cách nhanh chóng và tiện lợi. Hệ thống hỗ trợ 3 vai trò: Người dùng (USER), Chủ sân (OWNER) và Quản trị viên (ADMIN).

### ✨ Điểm nổi bật
- 🎯 **Đặt sân nhanh chóng** - Chỉ 3 bước đơn giản
- 💰 **Minh bạch giá cả** - Hiển thị rõ ràng, không phí ẩn
- 📊 **Thống kê chi tiết** - Báo cáo doanh thu trực quan
- 🔒 **Bảo mật cao** - JWT Authentication
- 📱 **Responsive** - Tương thích mọi thiết bị

---

## 🎯 Tính năng chính

### 🔐 Module 1: Xác thực & Phân quyền
| Tính năng | Mô tả |
|-----------|-------|
| Đăng ký tài khoản | 3 vai trò: USER, OWNER, ADMIN |
| Đăng nhập | JWT Token (24 giờ) |
| Đổi mật khẩu | Xác thực mật khẩu cũ |
| Cập nhật Profile | Họ tên, SĐT, địa chỉ |
| Khóa tài khoản | Thông báo khi bị khóa |

### ⚽ Module 2: Quản lý Sân bóng
| Vai trò | Quyền hạn |
|---------|-----------|
| USER | Xem danh sách sân đã duyệt, xem chi tiết |
| OWNER | Thêm/Sửa/Xóa sân, xem trạng thái duyệt |
| ADMIN | Xem tất cả, duyệt sân mới, xóa sân |

**Thông tin sân:**
- Tên, địa chỉ (Thành phố/Quận/Chi tiết)
- Loại sân: Sân 5, Sân 7, Sân 11
- Giá thuê/giờ, giờ hoạt động
- Mô tả, hình ảnh

### 🔍 Module 3: Tìm kiếm & Lọc
- 🔤 Tìm theo từ khóa (tên, địa chỉ)
- 🏙️ Lọc theo Thành phố/Quận
- ⚽ Lọc theo loại sân (5/7/11)
- 💵 Lọc theo khoảng giá
- 🔗 Kết hợp nhiều điều kiện

### 📅 Module 4: Đặt sân
| Tính năng | Mô tả |
|-----------|-------|
| Xem khung giờ trống | Slot còn trống trong ngày |
| Đặt sân | Chọn ngày, giờ bắt đầu/kết thúc |
| Xem lịch đặt | USER xem đơn của mình |
| Hủy đặt | Chỉ khi trạng thái PENDING |
| Xác nhận/Từ chối | OWNER duyệt đơn |

**Trạng thái đơn:**
```
PENDING → CONFIRMED → COMPLETED
    ↓         ↓
CANCELLED  REJECTED
```

**Auto-complete:** Scheduler tự động chuyển CONFIRMED → COMPLETED khi hết giờ

### ⭐ Module 5: Đánh giá & Bình luận
- ⭐ Điểm đánh giá: 1-5 sao
- 💬 Viết bình luận
- 📊 Tổng hợp điểm trung bình
- 🗑️ Xóa đánh giá (USER/ADMIN)

### 📊 Module 6: Thống kê doanh thu

**OWNER:**
- 💰 Tổng doanh thu (tháng/tổng)
- 📈 Biểu đồ doanh thu theo ngày
- 🏟️ Chi tiết từng sân
- 📅 Lọc theo khoảng thời gian

**ADMIN:**
- 📊 Tổng doanh thu hệ thống
- 👥 Số users, owners
- 🏟️ Số sân, đơn đặt

### 📥 Module 7: Xuất báo cáo
- 📗 **Excel (.xlsx)** - Chi tiết đơn đặt
- 📕 **PDF** - Báo cáo tổng hợp

### 👥 Module 8: Quản lý Users (ADMIN)
- 📋 Danh sách tất cả users
- 🔍 Lọc theo vai trò
- 🔒 Khóa/Mở khóa tài khoản
- 🔄 Thay đổi vai trò
- 🗑️ Xóa tài khoản

---

## 🛠️ Công nghệ sử dụng

### Backend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| Java | 17 | Ngôn ngữ chính |
| Spring Boot | 3.4.11 | Framework |
| Spring Security | - | Authentication |
| Spring Data JPA | - | ORM |
| JWT (jjwt) | 0.11.5 | Token Auth |
| MySQL | 8.0+ | Database |
| Apache POI | 5.2.5 | Export Excel |
| iText7 | 7.2.5 | Export PDF |
| Lombok | - | Reduce boilerplate |

### Frontend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| React | 19.2.0 | UI Library |
| Vite | 7.2.2 | Build Tool |
| React Router | 7.9.5 | Routing |
| Axios | 1.13.2 | HTTP Client |

### UI Theme
- 🟢 **Primary:** #1a5f2a (Xanh sân cỏ)
- 🟡 **Accent:** #fbbf24 (Vàng)
- 📱 Responsive Design

---

## 📂 Cấu trúc Project

```
smartpitchbooking/
├── 📁 src/main/java/com/dung/smartpitchbooking/
│   ├── 📁 config/           # DataInitializer
│   ├── 📁 controller/       # REST APIs
│   │   ├── AuthController.java
│   │   ├── UserController.java
│   │   ├── PitchController.java
│   │   ├── BookingController.java
│   │   ├── ReviewController.java
│   │   ├── StatisticsController.java
│   │   ├── ReportController.java
│   │   └── AdminController.java
│   ├── 📁 dto/              # Request/Response DTOs
│   ├── 📁 entity/           # JPA Entities
│   │   ├── User.java
│   │   ├── Pitch.java
│   │   ├── Booking.java
│   │   └── Review.java
│   ├── 📁 exception/        # Global Exception Handler
│   ├── 📁 repository/       # JPA Repositories
│   ├── 📁 scheduler/        # Scheduled Tasks
│   ├── 📁 security/         # JWT, Security Config
│   └── 📁 service/          # Business Logic
│
├── 📁 frontend/
│   ├── 📁 public/           # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/   # Navbar, SearchFilter
│   │   ├── 📁 contexts/     # AuthContext
│   │   ├── 📁 pages/        # 11 pages
│   │   └── 📁 services/     # API calls
│   └── package.json
│
├── pom.xml
└── README.md
```

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu
- ☕ Java JDK 17+
- 🐬 MySQL 8.0+
- 📦 Node.js 18+
- 🔧 Maven 3.8+

### 1️⃣ Clone project
```bash
git clone ...
cd smart_pitch_booking
```

### 2️⃣ Cấu hình Database
File `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartpitchbooking?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 3️⃣ Chạy Backend
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```
🌐 Backend: `http://localhost:8080`

### 4️⃣ Chạy Frontend
```bash
cd frontend
npm install
npm run dev
```
🌐 Frontend: `http://localhost:5173`

---

## 👥 Tài khoản test

| Username | Password | Role | Mô tả |
|----------|----------|------|-------|
| `admin` | `admin123` | ADMIN | Quản trị viên |
| `owner1` | `123456` | OWNER | Chủ sân (6 sân mẫu) |
| `user1` | `123456` | USER | Người dùng |

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |

### 👤 User
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/users/profile` | Lấy profile |
| PUT | `/api/users/profile` | Cập nhật profile |
| PUT | `/api/users/change-password` | Đổi mật khẩu |

### ⚽ Pitches
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/pitches` | - | Sân đã duyệt |
| GET | `/api/pitches/{id}` | - | Chi tiết sân |
| GET | `/api/pitches/search` | - | Tìm kiếm |
| GET | `/api/pitches/cities` | - | DS thành phố |
| POST | `/api/pitches` | OWNER | Tạo sân |
| PUT | `/api/pitches/{id}` | OWNER | Sửa sân |
| DELETE | `/api/pitches/{id}` | OWNER | Xóa sân |
| GET | `/api/pitches/my-pitches` | OWNER | Sân của tôi |
| GET | `/api/pitches/admin/all` | ADMIN | Tất cả sân |
| PUT | `/api/pitches/admin/{id}/approve` | ADMIN | Duyệt sân |

### 📅 Bookings
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/bookings/available-slots/{pitchId}` | - | Khung giờ trống |
| POST | `/api/bookings` | USER | Đặt sân |
| GET | `/api/bookings/my-bookings` | USER | Lịch của tôi |
| PUT | `/api/bookings/{id}/cancel` | USER | Hủy đặt |
| GET | `/api/bookings/owner/all` | OWNER | Đơn đặt sân |
| PUT | `/api/bookings/owner/{id}/confirm` | OWNER | Xác nhận |
| PUT | `/api/bookings/owner/{id}/reject` | OWNER | Từ chối |

### ⭐ Reviews
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/reviews/pitch/{pitchId}` | - | Đánh giá sân |
| GET | `/api/reviews/pitch/{pitchId}/summary` | - | Tổng hợp |
| POST | `/api/reviews` | USER | Tạo đánh giá |
| DELETE | `/api/reviews/{id}` | USER | Xóa |

### 📊 Statistics & Reports
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/statistics/owner` | OWNER | Thống kê |
| GET | `/api/statistics/admin` | ADMIN | Thống kê |
| GET | `/api/reports/owner/excel` | OWNER | Xuất Excel |
| GET | `/api/reports/owner/pdf` | OWNER | Xuất PDF |

### 👥 Admin
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/users` | DS users |
| PUT | `/api/admin/users/{id}/toggle-status` | Khóa/Mở |
| PUT | `/api/admin/users/{id}/change-role` | Đổi role |
| DELETE | `/api/admin/users/{id}` | Xóa user |

---

## 🔒 Bảo mật

- 🔑 **JWT Authentication** - Token 24h
- 🔐 **BCrypt Password** - Mã hóa mật khẩu
- 🛡️ **Role-based Auth** - @PreAuthorize
- 🌐 **CORS Config** - Frontend access


---

## 📝 License

MIT License

---

## 👨‍💻 Tác giả

**Nguyễn Văn Dũng**
- 🎓 MSSV: 4551190009
- 📧 Email: nguyenvandung6000@gmail.com

---

<div align="center">
  <br/>
  <strong>⚽ ĐặtSân247 - Đặt sân bóng chưa bao giờ dễ dàng đến thế! ⚽</strong>
  <br/><br/>
  Made with ❤️ in Vietnam
</div>
