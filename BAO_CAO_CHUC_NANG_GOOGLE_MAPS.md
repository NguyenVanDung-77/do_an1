# BÁO CÁO CHỨC NĂNG TÍCH HỢP GOOGLE MAPS CHO ĐỊA ĐIỂM SÂN

## 1. Tổng quan chức năng
Chức năng Google Maps được triển khai để hiển thị vị trí sân trực quan trên trang chi tiết, giúp người dùng dễ định vị và di chuyển.

Mục tiêu chính:
- Tăng độ tin cậy thông tin vị trí sân.
- Giảm nhầm lẫn địa chỉ khi người dùng đặt sân.
- Hỗ trợ mở nhanh Google Maps để dẫn đường.

Phạm vi hiện tại:
- Lưu tọa độ latitude/longitude cho mỗi sân.
- Cho phép chủ sân nhập tọa độ khi tạo/sửa sân.
- Hiển thị bản đồ nhúng tại trang chi tiết sân.
- Có cơ chế fallback theo text địa chỉ khi chưa có tọa độ.

## 2. Kiến trúc triển khai
Chức năng được tách thành 2 lớp rõ ràng:

1. Backend (Spring Boot)
- Bổ sung trường tọa độ cho entity sân.
- Mở rộng request/response để nhận và trả về tọa độ.
- Lưu và cập nhật tọa độ trong luồng tạo/sửa sân.

2. Frontend (React)
- Thêm input vĩ độ/kinh độ trong form quản lý sân.
- Hiển thị bản đồ nhúng trong trang chi tiết sân.
- Tạo link mở Google Maps theo tọa độ hoặc theo địa chỉ.

## 3. Danh sách tệp liên quan
### 3.1. Backend
- [src/main/java/com/dung/smartpitchbooking/entity/Pitch.java](src/main/java/com/dung/smartpitchbooking/entity/Pitch.java)
- [src/main/java/com/dung/smartpitchbooking/dto/PitchRequest.java](src/main/java/com/dung/smartpitchbooking/dto/PitchRequest.java)
- [src/main/java/com/dung/smartpitchbooking/dto/PitchResponse.java](src/main/java/com/dung/smartpitchbooking/dto/PitchResponse.java)
- [src/main/java/com/dung/smartpitchbooking/service/PitchService.java](src/main/java/com/dung/smartpitchbooking/service/PitchService.java)

### 3.2. Frontend
- [frontend/src/pages/MyPitches.jsx](frontend/src/pages/MyPitches.jsx)
- [frontend/src/pages/PitchDetail.jsx](frontend/src/pages/PitchDetail.jsx)

## 4. Thiết kế dữ liệu
### 4.1. Trường dữ liệu mới
Bổ sung vào bảng pitches:
- latitude: vĩ độ của sân.
- longitude: kinh độ của sân.

Đặc điểm:
- Hai trường này là tùy chọn (nullable).
- Không ảnh hưởng các sân cũ chưa có tọa độ.

### 4.2. DTO đồng bộ dữ liệu
- PitchRequest nhận latitude/longitude từ form owner.
- PitchResponse trả latitude/longitude để frontend render bản đồ.

## 5. Luồng xử lý backend
### 5.1. Tạo sân mới
Khi owner tạo sân, nếu nhập tọa độ thì hệ thống lưu kèm theo thông tin sân.

### 5.2. Cập nhật sân
Khi owner sửa sân, hệ thống cho phép chỉnh lại latitude/longitude.

### 5.3. Trả dữ liệu chi tiết sân
API chi tiết sân trả cả latitude/longitude để frontend quyết định cách hiển thị bản đồ.

## 6. Luồng xử lý frontend
### 6.1. Form quản lý sân của owner
Trang [frontend/src/pages/MyPitches.jsx](frontend/src/pages/MyPitches.jsx) đã bổ sung:
- Input Vĩ độ (Latitude).
- Input Kinh độ (Longitude).
- Nút mở Google Maps để tra nhanh tọa độ theo địa chỉ đã nhập.

### 6.2. Trang chi tiết sân
Trang [frontend/src/pages/PitchDetail.jsx](frontend/src/pages/PitchDetail.jsx) đã bổ sung:
- Khối bản đồ nhúng Google Maps.
- Nút mở bản đồ lớn.
- Link mở Google Maps trong phần thông tin sân.

## 7. Quy tắc hiển thị bản đồ
### 7.1. Ưu tiên theo tọa độ
Nếu có đủ latitude và longitude:
- Hệ thống dùng trực tiếp tọa độ để nhúng bản đồ.
- Độ chính xác vị trí cao nhất.

### 7.2. Fallback theo text địa chỉ
Nếu thiếu tọa độ:
- Hệ thống ghép chuỗi địa chỉ từ address + district + city.
- Dùng chuỗi này để tìm vị trí trên Google Maps.
- Vẫn hiển thị được bản đồ nhưng độ chính xác phụ thuộc chất lượng địa chỉ nhập.

## 8. Kiểm thử chức năng
### 8.1. Kiểm thử biên dịch
- Backend compile thành công.
- Frontend build thành công.

### 8.2. Kiểm thử dữ liệu có tọa độ
- Tạo/sửa sân có nhập latitude/longitude.
- Mở trang chi tiết sân.
- Bản đồ hiển thị đúng điểm theo tọa độ.

### 8.3. Kiểm thử dữ liệu không có tọa độ
- Để trống latitude/longitude.
- Mở trang chi tiết sân.
- Bản đồ vẫn hiển thị theo tìm kiếm text địa chỉ.

### 8.4. Kiểm thử mở Google Maps
- Bấm các nút mở bản đồ.
- Trình duyệt mở đúng vị trí sân tương ứng.

## 9. Điểm mạnh và hạn chế hiện tại
### 9.1. Điểm mạnh
- Triển khai nhanh, tương thích với dữ liệu cũ.
- Không bắt buộc API key cho bản nhúng hiện tại.
- Có fallback thông minh giúp không gián đoạn trải nghiệm.
- Owner chủ động cải thiện độ chính xác bằng cách nhập tọa độ.

### 9.2. Hạn chế
- Tọa độ hiện tại nhập thủ công, có thể sai nếu owner nhập nhầm.
- Fallback text địa chỉ có thể lệch vị trí ở một số địa chỉ mơ hồ.
- Chưa có kiểm tra tính hợp lệ nâng cao cho cặp tọa độ.

## 10. Đề xuất nâng cấp tiếp theo
1. Tích hợp Geocoding API để tự động suy ra tọa độ từ địa chỉ.
2. Bổ sung validate phạm vi tọa độ hợp lệ ngay tại form owner.
3. Thêm chọn điểm trực tiếp trên bản đồ thay vì nhập tay.
4. Bổ sung tìm sân gần vị trí hiện tại của người dùng.
5. Lưu mức độ tin cậy vị trí để hỗ trợ kiểm duyệt dữ liệu sân.

## 11. Kết luận
Chức năng tích hợp Google Maps cho địa điểm sân đã hoàn thành và hoạt động ổn định trong kiến trúc hiện tại của hệ thống.

Kết quả đạt được:
- Có thể lưu và cập nhật tọa độ sân trên backend.
- Owner có thể nhập tọa độ trong giao diện quản lý sân.
- Người dùng xem được bản đồ trực tiếp trong trang chi tiết sân.
- Hệ thống hỗ trợ cả trường hợp có tọa độ và không có tọa độ thông qua fallback địa chỉ.
