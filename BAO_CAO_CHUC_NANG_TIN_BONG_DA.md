# BÁO CÁO CHỨC NĂNG TRANG TIN BÓNG ĐÁ

## 1. Tổng quan chức năng
Chức năng Trang Tin Bóng Đá được phát triển nhằm bổ sung giá trị nội dung cho hệ thống đặt sân.

Mục tiêu chính:
- Cung cấp luồng đọc tin thể thao trực tiếp trong hệ thống.
- Tăng tần suất quay lại ứng dụng của người dùng.
- Tạo điểm mở rộng cho các tính năng nội dung ở các Sprint tiếp theo.

Phạm vi hiện tại:
- Tổng hợp tin từ các nguồn RSS thể thao.
- Chuẩn hóa dữ liệu tin tức về một cấu trúc chung.
- Hiển thị tin trên giao diện web.
- Hỗ trợ lọc tin theo giải đấu.

## 2. Kiến trúc triển khai
Chức năng được tách thành 2 lớp rõ ràng:

1. Backend (Spring Boot)
- Thu thập dữ liệu RSS từ nhiều nguồn.
- Parse XML thành đối tượng tin tức chuẩn.
- Làm sạch mô tả, chuẩn hóa thời gian.
- Gộp danh sách tin và sắp xếp mới nhất.
- Lọc theo giải đấu bằng từ khóa.
- Expose API public để frontend tiêu thụ.

2. Frontend (React)
- Gọi API tin tức.
- Hiển thị danh sách tin theo dạng thẻ.
- Cho phép chọn bộ lọc giải đấu bằng dropdown.
- Tải lại dữ liệu khi đổi bộ lọc.

## 3. Danh sách tệp liên quan
### 3.1. Backend
- [src/main/java/com/dung/smartpitchbooking/dto/FootballNewsItem.java](src/main/java/com/dung/smartpitchbooking/dto/FootballNewsItem.java)
- [src/main/java/com/dung/smartpitchbooking/service/NewsService.java](src/main/java/com/dung/smartpitchbooking/service/NewsService.java)
- [src/main/java/com/dung/smartpitchbooking/controller/NewsController.java](src/main/java/com/dung/smartpitchbooking/controller/NewsController.java)
- [src/main/java/com/dung/smartpitchbooking/security/SecurityConfig.java](src/main/java/com/dung/smartpitchbooking/security/SecurityConfig.java)

### 3.2. Frontend
- [frontend/src/services/api.js](frontend/src/services/api.js)
- [frontend/src/pages/FootballNews.jsx](frontend/src/pages/FootballNews.jsx)
- [frontend/src/App.jsx](frontend/src/App.jsx)
- [frontend/src/components/Navbar.jsx](frontend/src/components/Navbar.jsx)

## 4. Thiết kế dữ liệu
### 4.1. DTO chuẩn hóa tin tức
Dữ liệu tin được chuẩn hóa về cấu trúc:
- title: tiêu đề bài viết.
- link: liên kết bài gốc.
- summary: mô tả ngắn sau khi lọc HTML.
- source: tên nguồn RSS.
- publishedAt: thời gian chuẩn ISO-8601.
- imageUrl: ảnh đại diện (nếu có).

Lợi ích:
- Frontend không phụ thuộc vào cấu trúc RSS riêng từng báo.
- Dễ mở rộng thêm nguồn tin mới.

## 5. Luồng xử lý backend
### 5.1. Thu thập nguồn RSS
Service cấu hình nhiều nguồn RSS thể thao để tăng độ phủ dữ liệu.

### 5.2. Parse XML an toàn
Sử dụng cấu hình parser để giảm rủi ro parse XML không an toàn.

### 5.3. Làm sạch dữ liệu
- Loại bỏ thẻ HTML trong phần description.
- Rút gọn mô tả để hiển thị đẹp trên card.
- Chuẩn hóa thời gian đăng bài về định dạng thống nhất.

### 5.4. Tổng hợp và sắp xếp
- Gộp toàn bộ tin từ các nguồn.
- Sắp xếp theo thời gian mới nhất.
- Giới hạn số lượng trả về (top 30) để tối ưu tốc độ hiển thị.

### 5.5. Lọc theo giải đấu
Backend hỗ trợ tham số query league.

Các lựa chọn hiện tại:
- all
- premier_league
- champions_league
- la_liga
- serie_a
- bundesliga
- ligue_1
- v_league

Cơ chế lọc:
- Dựa trên tập từ khóa cho từng giải đấu.
- So khớp từ khóa trong tiêu đề và tóm tắt tin.

## 6. API thiết kế
### 6.1. Endpoint
- GET /api/news/football
- GET /api/news/football?league=all
- GET /api/news/football?league=premier_league

### 6.2. Quyền truy cập
Endpoint được mở public GET để cả người dùng chưa đăng nhập vẫn xem tin.

## 7. Luồng xử lý frontend
### 7.1. API client
Tạo module newsAPI trong tầng service để gọi endpoint tin tức.

### 7.2. Trang hiển thị
Trang [frontend/src/pages/FootballNews.jsx](frontend/src/pages/FootballNews.jsx) đảm nhiệm:
- Hiển thị tiêu đề và mô tả trang.
- Hiển thị dropdown lọc giải đấu.
- Hiển thị trạng thái loading, empty, error.
- Render danh sách card tin tức.

### 7.3. Route và điều hướng
- Đăng ký route mới ở [frontend/src/App.jsx](frontend/src/App.jsx): đường dẫn news.
- Thêm mục menu điều hướng trong [frontend/src/components/Navbar.jsx](frontend/src/components/Navbar.jsx).

## 8. Kiểm thử chức năng
### 8.1. Kiểm thử biên dịch
- Backend compile thành công.
- Frontend build thành công.

### 8.2. Kiểm thử API theo bộ lọc
Đã kiểm tra endpoint với nhiều giá trị league và ghi nhận số lượng trả về khác nhau.
Điều này xác nhận filter hoạt động đúng logic.

### 8.3. Kiểm thử giao diện
- Truy cập trang tin từ menu điều hướng.
- Đổi giá trị dropdown và quan sát danh sách cập nhật theo giải đấu.
- Kiểm tra mở link bài viết gốc ở tab mới.

## 9. Điểm mạnh và hạn chế hiện tại
### 9.1. Điểm mạnh
- Không cần API key, dễ triển khai.
- Dữ liệu tổng hợp đa nguồn.
- Có sẵn bộ lọc giải đấu.
- Kiến trúc tách lớp rõ ràng, dễ mở rộng.

### 9.2. Hạn chế
- Lọc theo từ khóa nên chưa đạt độ chính xác tuyệt đối.
- Phụ thuộc tính ổn định của nguồn RSS bên ngoài.
- Chưa có cache backend nên còn gọi mạng trực tiếp khi tải trang.

## 10. Đề xuất nâng cấp tiếp theo
1. Bổ sung cache backend (5-10 phút) để tăng tốc và giảm tải mạng.
2. Chuẩn hóa bộ phân loại giải đấu nâng cao hơn từ khóa (rule nâng cao hoặc NLP nhẹ).
3. Cho phép người dùng lưu tin yêu thích.
4. Thêm trang chi tiết tin nội bộ với bộ lọc nâng cao theo thời gian và nguồn.
5. Thêm job nền để đồng bộ định kỳ, giảm độ trễ khi người dùng truy cập.

## 11. Kết luận
Chức năng Trang Tin Bóng Đá đã được tích hợp hoàn chỉnh theo kiến trúc backend và frontend hiện tại của hệ thống.

Kết quả đạt được:
- Có luồng nội dung thể thao tích hợp trực tiếp trong ứng dụng.
- Có API public ổn định cho frontend sử dụng.
- Có bộ lọc theo giải đấu để tăng tính hữu dụng.
- Đảm bảo khả năng phát triển tiếp ở các Sprint sau.
