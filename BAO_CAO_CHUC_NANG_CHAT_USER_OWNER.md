# BÁO CÁO CHỨC NĂNG CHAT GIỮA USER VÀ CHỦ SÂN

## 1. Tổng quan chức năng
Chức năng chat được triển khai để hỗ trợ trao đổi trực tiếp giữa người đặt sân (USER) và chủ sân (OWNER) theo từng đơn đặt sân cụ thể.

Mục tiêu chính:
- Tăng khả năng phối hợp trước giờ đá (xác nhận thông tin, ghi chú, liên hệ nhanh).
- Giảm phụ thuộc vào gọi điện ngoài hệ thống.
- Tạo lịch sử trao đổi gắn với booking để dễ truy vết.

Phạm vi hiện tại (MVP):
- Mỗi booking tương ứng một phòng chat.
- USER và OWNER liên quan booking có thể gửi/nhận tin nhắn văn bản.
- ADMIN có quyền xem cuộc trò chuyện để giám sát khi cần.
- Danh sách cuộc trò chuyện hiển thị tin nhắn gần nhất.
- Tin nhắn cập nhật theo polling chu kỳ 5 giây.

Không nằm trong phạm vi hiện tại:
- Gửi ảnh/tệp/emoji nâng cao.
- Trạng thái đã xem/chưa xem.
- Thông báo đẩy realtime (WebSocket/Push Notification).

## 2. Kiến trúc triển khai
Chức năng được tách thành 2 lớp rõ ràng:

1. Backend (Spring Boot)
- Quản lý dữ liệu tin nhắn theo booking.
- Kiểm soát phân quyền truy cập chat theo quan hệ người dùng với booking.
- Cung cấp API lấy danh sách hội thoại, lấy tin nhắn, gửi tin nhắn.

2. Frontend (React)
- Hiển thị danh sách cuộc trò chuyện theo user hiện tại.
- Hiển thị nội dung tin nhắn trong phòng chat theo booking.
- Cho phép gửi tin nhắn mới.
- Tự làm mới dữ liệu bằng polling để đảm bảo đồng bộ.

## 3. Danh sách tệp liên quan
### 3.1. Backend
- [src/main/java/com/dung/smartpitchbooking/entity/ChatMessage.java](src/main/java/com/dung/smartpitchbooking/entity/ChatMessage.java)
- [src/main/java/com/dung/smartpitchbooking/repository/ChatMessageRepository.java](src/main/java/com/dung/smartpitchbooking/repository/ChatMessageRepository.java)
- [src/main/java/com/dung/smartpitchbooking/dto/ChatMessageRequest.java](src/main/java/com/dung/smartpitchbooking/dto/ChatMessageRequest.java)
- [src/main/java/com/dung/smartpitchbooking/dto/ChatMessageResponse.java](src/main/java/com/dung/smartpitchbooking/dto/ChatMessageResponse.java)
- [src/main/java/com/dung/smartpitchbooking/dto/ChatConversationResponse.java](src/main/java/com/dung/smartpitchbooking/dto/ChatConversationResponse.java)
- [src/main/java/com/dung/smartpitchbooking/service/ChatService.java](src/main/java/com/dung/smartpitchbooking/service/ChatService.java)
- [src/main/java/com/dung/smartpitchbooking/controller/ChatController.java](src/main/java/com/dung/smartpitchbooking/controller/ChatController.java)

### 3.2. Frontend
- [frontend/src/services/api.js](frontend/src/services/api.js)
- [frontend/src/pages/ChatPage.jsx](frontend/src/pages/ChatPage.jsx)
- [frontend/src/App.jsx](frontend/src/App.jsx)
- [frontend/src/components/Navbar.jsx](frontend/src/components/Navbar.jsx)
- [frontend/src/pages/MyBookings.jsx](frontend/src/pages/MyBookings.jsx)
- [frontend/src/pages/OwnerBookings.jsx](frontend/src/pages/OwnerBookings.jsx)

## 4. Thiết kế dữ liệu
### 4.1. Bảng chat_messages
Bảng `chat_messages` lưu từng tin nhắn trong hệ thống.

Các trường chính:
- id: khóa chính.
- booking_id: liên kết đến đơn đặt sân (booking).
- sender_id: người gửi tin nhắn.
- content: nội dung tin nhắn (text).
- created_at: thời điểm tạo tin nhắn.

Quan hệ dữ liệu:
- Nhiều tin nhắn thuộc một booking.
- Mỗi tin nhắn thuộc đúng một sender.

### 4.2. DTO trả về cho giao diện
1. ChatConversationResponse
- bookingId, pitchId, pitchName.
- bookingDate, bookingStatus.
- counterpartId, counterpartName, counterpartRole.
- lastMessage, lastMessageAt.

2. ChatMessageResponse
- id, bookingId.
- senderId, senderName, senderRole.
- content.
- isMine (xác định message của chính user hiện tại hay không).
- createdAt.

## 5. Quy tắc phân quyền
### 5.1. Truy cập cuộc trò chuyện theo booking
Một người dùng được phép truy cập chat booking nếu thuộc một trong các điều kiện:
- Là người đặt sân của booking.
- Là chủ sân của pitch trong booking.
- Là ADMIN.

Nếu không thỏa các điều kiện trên, API trả lỗi từ chối truy cập.

### 5.2. Gửi tin nhắn
Quyền gửi tin nhắn áp dụng theo cùng quy tắc truy cập booking.

Ràng buộc nội dung:
- Không chấp nhận tin nhắn rỗng.
- Nội dung được trim trước khi lưu.

## 6. API thiết kế
### 6.1. Danh sách endpoint
- GET /api/chat/conversations
- GET /api/chat/booking/{bookingId}/messages
- POST /api/chat/booking/{bookingId}/messages

### 6.2. Ý nghĩa từng endpoint
1. GET /api/chat/conversations
- Trả danh sách hội thoại theo user hiện tại.
- USER: hội thoại của các booking do mình đặt.
- OWNER: hội thoại của các booking thuộc sân của mình.
- ADMIN: có thể xem toàn bộ hội thoại.

2. GET /api/chat/booking/{bookingId}/messages
- Trả toàn bộ tin nhắn của một phòng chat theo thứ tự thời gian tăng dần.

3. POST /api/chat/booking/{bookingId}/messages
- Gửi một tin nhắn mới vào phòng chat của booking.

## 7. Luồng xử lý backend
### 7.1. Lấy danh sách hội thoại
- Xác định user hiện tại từ security context.
- Truy vấn danh sách booking phù hợp theo role.
- Với mỗi booking, lấy tin nhắn gần nhất để hiển thị preview.
- Trả kết quả đã sắp xếp theo thời gian tin nhắn mới nhất.

### 7.2. Lấy danh sách tin nhắn
- Kiểm tra booking tồn tại.
- Kiểm tra user có quyền truy cập booking.
- Truy vấn tin nhắn của booking theo createdAt tăng dần.
- Mapping sang ChatMessageResponse, tính cờ isMine cho từng message.

### 7.3. Gửi tin nhắn
- Kiểm tra booking tồn tại và quyền truy cập.
- Chuẩn hóa và validate nội dung.
- Lưu ChatMessage mới.
- Trả bản ghi vừa lưu dưới dạng ChatMessageResponse.

## 8. Luồng xử lý frontend
### 8.1. Điều hướng vào chat
Người dùng có thể vào chat từ:
- Menu điều hướng chung (mục Chat).
- Nút chat trực tiếp ở danh sách đơn đặt của USER.
- Nút chat trực tiếp ở bảng đơn của OWNER.

### 8.2. Trang ChatPage
Trang chat gồm 2 khu vực:
1. Sidebar hội thoại
- Hiển thị danh sách phòng chat theo booking.
- Hiển thị trạng thái booking, đối tác chat, tin nhắn cuối.

2. Khung nội dung chat
- Hiển thị toàn bộ tin nhắn của phòng đang chọn.
- Tin nhắn của chính user hiển thị kiểu bubble riêng (isMine).
- Có ô nhập và nút gửi.

### 8.3. Cập nhật dữ liệu định kỳ
- Polling danh sách hội thoại theo chu kỳ 5 giây.
- Polling tin nhắn của phòng hiện tại theo chu kỳ 5 giây.
- Khi gửi tin nhắn: làm mới ngay message list và conversation list.

## 9. Xử lý lỗi và ổn định giao diện
Trong quá trình triển khai đã xử lý các vấn đề thực tế:
- Lỗi trắng trang do gọi callback trước khi khởi tạo (ReferenceError) tại ChatPage.
- Cảnh báo style do trộn shorthand `margin` và non-shorthand `marginTop`.
- Cải tiến đồng bộ `bookingId` trên query và state để giảm rủi ro race/loop.

Kết quả hiện tại:
- Trang chat render ổn định.
- Build frontend thành công.
- Không còn lỗi compile trong file chat chính.

## 10. Kiểm thử chức năng
### 10.1. Kiểm thử biên dịch
- Backend compile thành công.
- Frontend build thành công.

### 10.2. Kiểm thử nghiệp vụ cơ bản
1. User đặt sân -> mở chat theo booking.
2. Owner mở đúng booking -> thấy cùng phòng chat.
3. User gửi tin -> owner nhận được sau polling.
4. Owner gửi tin -> user nhận được sau polling.
5. Từ chối truy cập khi user không liên quan booking.

### 10.3. Kiểm thử điều hướng
- Vào chat từ navbar.
- Vào chat từ trang đơn đặt user.
- Vào chat từ trang quản lý đơn owner.
- Chuyển qua lại giữa các hội thoại vẫn giữ trạng thái đúng theo bookingId trên URL.

## 11. Điểm mạnh và hạn chế hiện tại
### 11.1. Điểm mạnh
- Triển khai nhanh, bám sát nghiệp vụ booking.
- Phân quyền rõ ràng theo quan hệ người dùng và đơn đặt.
- Luồng giao diện dễ dùng, có điểm vào chat từ nhiều màn.
- Cấu trúc dữ liệu và API đủ tốt để nâng cấp realtime sau này.

### 11.2. Hạn chế
- Polling có độ trễ vài giây, chưa realtime tức thì.
- Chưa có trạng thái đã xem/chưa xem.
- Chưa hỗ trợ gửi file/ảnh.
- Chưa có cơ chế thông báo khi có tin nhắn mới ngoài màn chat.

## 12. Đề xuất nâng cấp tiếp theo
1. Nâng từ polling lên WebSocket/STOMP để chat realtime.
2. Bổ sung unread count theo hội thoại.
3. Bổ sung trạng thái seen/read receipt.
4. Hỗ trợ gửi ảnh/tệp và giới hạn kích thước nội dung.
5. Thêm công cụ moderation cho admin (ẩn/xóa tin vi phạm).
6. Thêm push notification hoặc toast toàn hệ thống khi có tin mới.

## 13. Kết luận
Chức năng chat giữa USER và OWNER theo từng booking đã được tích hợp thành công, đáp ứng mục tiêu MVP của Sprint.

Kết quả đạt được:
- Có phòng chat theo đơn đặt sân.
- Có API và phân quyền đầy đủ cho truy cập/gửi tin.
- Có giao diện chat hoạt động ổn định cho cả user và chủ sân.
- Có nền tảng kỹ thuật rõ ràng để nâng cấp lên realtime trong các Sprint tiếp theo.
