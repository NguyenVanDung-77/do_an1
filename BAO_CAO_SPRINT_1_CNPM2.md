# BÁO CÁO SPRINT 1 - ĐỒ ÁN CÔNG NGHỆ PHẦN MỀM 2

## 1. Thông tin sinh viên
- Họ và tên: Nguyễn Văn Dũng
- Mã sinh viên: 4551190009
- GitHub: https://github.com/NguyenVanDung-77/do_an1
- Dự án: Smart Pitch Booking (phát triển tiếp từ Đồ án Công nghệ phần mềm 1)

## 2. Mục tiêu Sprint 1
Sprint 1 tập trung phát triển và hoàn thiện các yêu cầu nghiệp vụ mới theo góp ý giảng viên, đảm bảo:
- Phân tách giao diện theo vai trò người dùng.
- Đồng bộ dữ liệu hiển thị theo trạng thái khóa tài khoản.
- Điều chỉnh quy tắc hủy đơn đặt sân phù hợp thực tế vận hành.

## 3. Phạm vi thực hiện
Các chức năng đã hoàn thành trong Sprint 1:
1. Mỗi role có giao diện riêng, không dùng chung.
2. Khi khóa tài khoản owner thì user không thấy sân của owner đó.
3. Khi khóa user thì bình luận của user đó không hiển thị ở sân.
4. Khi owner đã xác nhận đơn, user vẫn có quyền hủy đơn.

## 4. Chi tiết các chức năng đã phát triển

### 4.1. Phân tách giao diện theo vai trò
Mô tả:
- Bổ sung luồng điều hướng theo vai trò sau đăng nhập.
- Tạo giao diện riêng cho USER, OWNER, ADMIN.
- Chuẩn hóa thanh điều hướng theo vai trò, giữ thương hiệu ĐặtSân247.

Kết quả:
- USER vào trang riêng cho người đặt sân.
- OWNER vào trang riêng cho quản lý sân, đơn đặt, thống kê.
- ADMIN vào trang riêng cho duyệt sân và quản lý người dùng.

Các tệp liên quan:
- [frontend/src/App.jsx](frontend/src/App.jsx)
- [frontend/src/components/Navbar.jsx](frontend/src/components/Navbar.jsx)
- [frontend/src/pages/UserHome.jsx](frontend/src/pages/UserHome.jsx)
- [frontend/src/pages/OwnerHome.jsx](frontend/src/pages/OwnerHome.jsx)
- [frontend/src/pages/AdminHome.jsx](frontend/src/pages/AdminHome.jsx)

---

### 4.2. Khóa owner thì ẩn toàn bộ sân owner đó khỏi user
Mô tả:
- Chỉ hiển thị sân public khi thỏa 3 điều kiện: sân được duyệt, sân đang active, owner đang active.
- Chặn truy cập chi tiết sân public nếu owner đã bị khóa.
- Chặn đặt sân và xem khung giờ nếu sân không còn khả dụng do owner bị khóa.

Kết quả:
- User không thấy sân của owner đã bị khóa ở danh sách, tìm kiếm, lọc, chi tiết.
- Không thể lách bằng cách gọi API trực tiếp theo ID sân.

Các tệp liên quan:
- [src/main/java/com/dung/smartpitchbooking/repository/PitchRepository.java](src/main/java/com/dung/smartpitchbooking/repository/PitchRepository.java)
- [src/main/java/com/dung/smartpitchbooking/service/PitchService.java](src/main/java/com/dung/smartpitchbooking/service/PitchService.java)
- [src/main/java/com/dung/smartpitchbooking/service/BookingService.java](src/main/java/com/dung/smartpitchbooking/service/BookingService.java)

---

### 4.3. Khóa user thì ẩn bình luận của user đó
Mô tả:
- Chỉ lấy review của user đang active khi hiển thị danh sách review cho sân.
- Điểm trung bình và tổng số review chỉ tính các review thuộc user đang active.

Kết quả:
- Review của user bị khóa không còn hiển thị ở giao diện sân.
- Chỉ số rating và số lượng bình luận phản ánh đúng dữ liệu còn hiệu lực.

Các tệp liên quan:
- [src/main/java/com/dung/smartpitchbooking/repository/ReviewRepository.java](src/main/java/com/dung/smartpitchbooking/repository/ReviewRepository.java)
- [src/main/java/com/dung/smartpitchbooking/service/ReviewService.java](src/main/java/com/dung/smartpitchbooking/service/ReviewService.java)

---

### 4.4. User được hủy đơn khi owner đã xác nhận
Mô tả:
- Cập nhật logic hủy đơn: cho phép hủy khi trạng thái là PENDING hoặc CONFIRMED.
- Cập nhật mô tả endpoint tương ứng để đồng nhất với nghiệp vụ mới.

Kết quả:
- User có thể chủ động hủy đơn ngay cả khi owner đã xác nhận đơn.
- Tránh mâu thuẫn giữa giao diện và xử lý backend.

Các tệp liên quan:
- [src/main/java/com/dung/smartpitchbooking/service/BookingService.java](src/main/java/com/dung/smartpitchbooking/service/BookingService.java)
- [src/main/java/com/dung/smartpitchbooking/controller/BookingController.java](src/main/java/com/dung/smartpitchbooking/controller/BookingController.java)

## 5. Kiểm thử và xác nhận kết quả
Đã thực hiện các bước xác nhận chính:
- Build frontend thành công sau các thay đổi giao diện theo role.
- Compile backend thành công sau các thay đổi nghiệp vụ.
- Kiểm tra API theo tình huống khóa owner: dữ liệu sân public được ẩn đúng.
- Kiểm tra API review: bình luận user bị khóa không được trả ra.
- Kiểm tra luồng hủy đơn: đơn CONFIRMED có thể hủy bởi user.

## 6. Kết luận Sprint 1
Sprint 1 đã hoàn thành đầy đủ 4 yêu cầu chức năng phát triển thêm của môn Công nghệ phần mềm 2.

Giá trị đạt được:
- Tăng tính phân vai và trải nghiệm người dùng theo role.
- Đồng bộ dữ liệu hiển thị theo trạng thái tài khoản, đảm bảo đúng nghiệp vụ.
- Cải thiện linh hoạt vận hành cho luồng đặt sân và hủy đơn.

## 7. Định hướng Sprint tiếp theo
Đề xuất cho Sprint 2:
- Bổ sung kiểm thử tự động (unit test, integration test) cho các rule nghiệp vụ mới.
- Hoàn thiện responsive navbar và giao diện mobile cho từng role.
- Chuẩn hóa xử lý lỗi frontend theo mã lỗi backend để thông báo thân thiện hơn.
