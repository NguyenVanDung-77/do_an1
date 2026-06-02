# BÁO CÁO CHỨC NĂNG THANH TOÁN VIETQR

## 1. Tổng quan chức năng
Chức năng Thanh toán VietQR được triển khai để hỗ trợ thanh toán nhanh cho đơn đặt sân mà không phụ thuộc cổng thanh toán trung gian phức tạp.

Mục tiêu chính:
- Cho phép người dùng thanh toán bằng quét mã QR ngân hàng.
- Triển khai nhanh, phù hợp tiến độ Sprint.
- Tối ưu cho mô hình marketplace: mỗi chủ sân nhận tiền về tài khoản riêng.

Phạm vi hiện tại:
- Tạo mã VietQR theo đúng chủ sân của đơn đặt.
- Hiển thị thông tin chuyển khoản cho người dùng.
- Cho phép người dùng gửi yêu cầu xác nhận đã chuyển khoản.
- Cho phép chủ sân/Admin xác nhận đã nhận tiền.
- Theo dõi trạng thái thanh toán theo từng booking.

## 2. Kiến trúc triển khai
Chức năng được tách thành 2 lớp rõ ràng:

1. Backend (Spring Boot)
- Quản lý dữ liệu thanh toán theo từng booking.
- Tạo URL ảnh VietQR động từ thông tin tài khoản chủ sân.
- Quản lý trạng thái thanh toán: UNPAID, PENDING, PAID, FAILED.
- Cung cấp API cho user tạo QR và gửi yêu cầu xác nhận.
- Cung cấp API cho owner/admin xác nhận đã nhận tiền.

2. Frontend (React)
- Tạo luồng mở trang thanh toán VietQR từ danh sách đơn đặt.
- Hiển thị QR + BIN + số tài khoản + tên tài khoản + nội dung chuyển khoản.
- Cho phép user bấm Tôi đã chuyển khoản.
- Cho phép owner xác nhận đã nhận tiền tại trang quản lý đơn.
- Hiển thị trạng thái thanh toán tại user và owner.

## 3. Danh sách tệp liên quan
### 3.1. Backend
- [src/main/java/com/dung/smartpitchbooking/entity/Payment.java](src/main/java/com/dung/smartpitchbooking/entity/Payment.java)
- [src/main/java/com/dung/smartpitchbooking/repository/PaymentRepository.java](src/main/java/com/dung/smartpitchbooking/repository/PaymentRepository.java)
- [src/main/java/com/dung/smartpitchbooking/dto/PaymentCreateResponse.java](src/main/java/com/dung/smartpitchbooking/dto/PaymentCreateResponse.java)
- [src/main/java/com/dung/smartpitchbooking/dto/PaymentStatusResponse.java](src/main/java/com/dung/smartpitchbooking/dto/PaymentStatusResponse.java)
- [src/main/java/com/dung/smartpitchbooking/controller/PaymentController.java](src/main/java/com/dung/smartpitchbooking/controller/PaymentController.java)
- [src/main/java/com/dung/smartpitchbooking/service/PaymentService.java](src/main/java/com/dung/smartpitchbooking/service/PaymentService.java)
- [src/main/java/com/dung/smartpitchbooking/entity/User.java](src/main/java/com/dung/smartpitchbooking/entity/User.java)
- [src/main/java/com/dung/smartpitchbooking/dto/UpdateProfileRequest.java](src/main/java/com/dung/smartpitchbooking/dto/UpdateProfileRequest.java)
- [src/main/java/com/dung/smartpitchbooking/dto/UserResponse.java](src/main/java/com/dung/smartpitchbooking/dto/UserResponse.java)
- [src/main/java/com/dung/smartpitchbooking/service/UserService.java](src/main/java/com/dung/smartpitchbooking/service/UserService.java)
- [src/main/resources/application.properties](src/main/resources/application.properties)

### 3.2. Frontend
- [frontend/src/services/api.js](frontend/src/services/api.js)
- [frontend/src/pages/MyBookings.jsx](frontend/src/pages/MyBookings.jsx)
- [frontend/src/pages/PaymentQR.jsx](frontend/src/pages/PaymentQR.jsx)
- [frontend/src/pages/OwnerBookings.jsx](frontend/src/pages/OwnerBookings.jsx)
- [frontend/src/pages/Profile.jsx](frontend/src/pages/Profile.jsx)
- [frontend/src/App.jsx](frontend/src/App.jsx)

## 4. Thiết kế dữ liệu
### 4.1. Bảng payments
Mỗi booking có tối đa 1 bản ghi payment (ràng buộc one-to-one).

Trường chính:
- booking_id: liên kết booking.
- amount: số tiền thanh toán.
- provider: nhà cung cấp thanh toán (VIETQR).
- txn_ref: mã giao dịch nội bộ.
- status: trạng thái thanh toán.
- payment_url: URL ảnh QR.
- paid_at: thời điểm xác nhận đã thanh toán.
- failure_reason: ghi chú trạng thái trung gian/thất bại.

### 4.2. Thông tin tài khoản ngân hàng của chủ sân
Mô hình 2 yêu cầu owner cấu hình:
- bankBin: mã BIN ngân hàng.
- bankAccountNo: số tài khoản nhận tiền.
- bankAccountName: tên tài khoản nhận tiền.

Thông tin này được lưu tại user role OWNER và dùng trực tiếp để tạo VietQR.

## 5. Luồng xử lý backend
### 5.1. User tạo QR thanh toán
- User chọn đơn ở trạng thái PENDING hoặc CONFIRMED.
- Hệ thống kiểm tra quyền user/admin.
- Hệ thống lấy owner của pitch trong booking.
- Hệ thống kiểm tra owner đã cấu hình đủ thông tin ngân hàng chưa.
- Hệ thống tạo hoặc tái sử dụng payment, sinh URL VietQR và trả về frontend.

### 5.2. User gửi yêu cầu xác nhận chuyển khoản
- User bấm Tôi đã chuyển khoản.
- API chuyển trạng thái về PENDING (nếu chưa PAID) kèm ghi chú chờ xác nhận.

### 5.3. Owner/Admin xác nhận đã nhận tiền
- Owner của sân hoặc Admin gọi API xác nhận.
- Hệ thống cập nhật status = PAID, ghi paidAt.

### 5.4. Chống lỗi gọi lặp tạo thanh toán
Đã bổ sung xử lý idempotent:
- Bắt DataIntegrityViolationException khi có gọi đồng thời.
- Nếu bản ghi đã tồn tại thì trả dữ liệu hiện có thay vì báo lỗi SQL.
- Frontend cũng chặn gọi lặp effect ở trang QR.

## 6. API thiết kế
### 6.1. Endpoint chính
- POST /api/payments/vietqr/create?bookingId={id}
- PUT /api/payments/booking/{bookingId}/request-confirmation
- PUT /api/payments/booking/{bookingId}/confirm
- GET /api/payments/booking/{bookingId}
- GET /api/payments/vietqr/health

### 6.2. Quyền truy cập
- User/Admin: tạo QR cho đơn thuộc quyền truy cập.
- User/Admin: gửi yêu cầu đã chuyển khoản.
- Owner (đúng sân) hoặc Admin: xác nhận đã nhận tiền.
- User/Owner/Admin liên quan đơn: xem trạng thái thanh toán.

## 7. Luồng xử lý frontend
### 7.1. User flow
- Vào trang Lịch đặt sân của tôi.
- Với đơn PENDING/CONFIRMED chưa thanh toán, bấm Thanh toán VietQR.
- Chuyển sang trang QR tại route payment/qr.
- Quét QR, chuyển khoản, bấm Tôi đã chuyển khoản.

### 7.2. Owner flow
- Vào trang Đơn đặt.
- Xem trạng thái thanh toán của từng booking.
- Bấm Xác nhận đã nhận tiền khi đã nhận chuyển khoản thực tế.

### 7.3. Owner cấu hình tài khoản nhận tiền
- Vào trang Hồ sơ.
- Nhập BIN, số tài khoản, tên tài khoản ngân hàng.
- Lưu cấu hình để hệ thống dùng tạo mã VietQR cho các đơn thuộc sân của owner.

## 8. Kiểm thử chức năng
### 8.1. Kiểm thử biên dịch
- Backend compile thành công.
- Frontend build thành công.

### 8.2. Kiểm thử luồng nghiệp vụ
- User tạo QR thành công khi owner đã có thông tin ngân hàng.
- User gửi yêu cầu xác nhận thành công.
- Owner xác nhận đã nhận tiền thành công.
- Trạng thái thanh toán hiển thị đúng ở cả trang user và owner.

### 8.3. Kiểm thử lỗi biên
- Đơn đã PAID không tạo thanh toán lại.
- Owner chưa cấu hình ngân hàng sẽ bị chặn tạo QR và báo lỗi rõ ràng.
- Trường hợp gọi lặp tạo QR không còn ném lỗi duplicate key.

## 9. Điểm mạnh và hạn chế hiện tại
### 9.1. Điểm mạnh
- Tốc độ triển khai nhanh, không cần tích hợp cổng thanh toán phức tạp.
- Bám sát mô hình marketplace: chủ sân nhận tiền trực tiếp.
- Luồng thao tác đơn giản cho cả user và owner.
- Có cơ chế hạn chế lỗi gọi lặp khi tạo thanh toán.

### 9.2. Hạn chế
- Xác nhận thanh toán hiện tại là bán thủ công (owner/admin xác nhận).
- Chưa có đối soát tự động theo sao kê ngân hàng.
- Chưa có log giao dịch ngoài hệ thống ngân hàng.

## 10. Đề xuất nâng cấp tiếp theo
1. Tự động đối soát sao kê qua webhook/API ngân hàng nếu khả dụng.
2. Bổ sung trạng thái trung gian rõ hơn: WAITING_TRANSFER, WAITING_CONFIRM.
3. Thêm lịch sử thao tác xác nhận thanh toán (audit log).
4. Thêm nhắc nhở owner với các đơn đã được user gửi yêu cầu xác nhận nhưng chưa duyệt.
5. Thêm dashboard tách doanh thu đã thanh toán và chưa thanh toán.

## 11. Kết luận
Chức năng Thanh toán VietQR đã hoàn thành theo mô hình 2 (mỗi chủ sân dùng tài khoản ngân hàng riêng).

Kết quả đạt được:
- User thanh toán bằng QR đúng theo chủ sân của đơn đặt.
- Owner có thể cấu hình thông tin ngân hàng trực tiếp trong hồ sơ.
- Owner/Admin có thể xác nhận thanh toán ngay trên hệ thống.
- Luồng đã ổn định và phù hợp để demo/đưa vào Sprint hiện tại.
