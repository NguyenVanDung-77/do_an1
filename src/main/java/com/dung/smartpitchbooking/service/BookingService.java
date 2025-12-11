package com.dung.smartpitchbooking.service;

import com.dung.smartpitchbooking.dto.BookingRequest;
import com.dung.smartpitchbooking.dto.BookingResponse;
import com.dung.smartpitchbooking.dto.TimeSlotResponse;
import com.dung.smartpitchbooking.entity.Booking;
import com.dung.smartpitchbooking.entity.Booking.BookingStatus;
import com.dung.smartpitchbooking.entity.Pitch;
import com.dung.smartpitchbooking.entity.User;
import com.dung.smartpitchbooking.repository.BookingRepository;
import com.dung.smartpitchbooking.repository.PitchRepository;
import com.dung.smartpitchbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private PitchRepository pitchRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Lấy danh sách khung giờ của một sân trong ngày cụ thể
     */
    public List<TimeSlotResponse> getAvailableTimeSlots(Long pitchId, LocalDate date) {
        Pitch pitch = pitchRepository.findById(pitchId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sân"));
        
        // Lấy danh sách booking đã đặt trong ngày
        List<Booking> bookedSlots = bookingRepository.findBookedSlots(pitchId, date);
        Set<String> bookedTimes = bookedSlots.stream()
                .map(b -> b.getStartTime() + "-" + b.getEndTime())
                .collect(Collectors.toSet());
        
        // Tạo danh sách khung giờ từ giờ mở cửa đến giờ đóng cửa
        List<TimeSlotResponse> timeSlots = new ArrayList<>();
        LocalTime openTime = LocalTime.parse(pitch.getOpenTime());
        LocalTime closeTime = LocalTime.parse(pitch.getCloseTime());
        
        // Lấy thời gian hiện tại để kiểm tra khung giờ đã qua
        LocalTime now = LocalTime.now();
        boolean isToday = date.equals(LocalDate.now());
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        LocalTime currentTime = openTime;
        
        while (currentTime.isBefore(closeTime)) {
            LocalTime endTime = currentTime.plusHours(1);
            if (endTime.isAfter(closeTime)) {
                break;
            }
            
            TimeSlotResponse slot = new TimeSlotResponse();
            slot.setStartTime(currentTime.format(formatter));
            slot.setEndTime(endTime.format(formatter));
            slot.setPrice(pitch.getPricePerHour());
            
            // Kiểm tra xem khung giờ này đã được đặt chưa
            String timeKey = slot.getStartTime() + "-" + slot.getEndTime();
            boolean isBookedByOther = bookedTimes.contains(timeKey);
            
            // Nếu là ngày hôm nay và khung giờ đã qua -> đánh dấu là không khả dụng
            boolean isPastTime = isToday && currentTime.isBefore(now);
            
            slot.setIsBooked(isBookedByOther || isPastTime);
            
            timeSlots.add(slot);
            currentTime = endTime;
        }
        
        return timeSlots;
    }
    
    /**
     * Đặt sân
     */
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User currentUser = getCurrentUser();
        
        Pitch pitch = pitchRepository.findById(request.getPitchId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sân"));
        
        // Kiểm tra sân đã được duyệt chưa
        if (!pitch.getIsApproved()) {
            throw new RuntimeException("Sân chưa được duyệt, không thể đặt");
        }
        
        // Kiểm tra ngày đặt không được trong quá khứ
        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Không thể đặt sân cho ngày trong quá khứ");
        }
        
        // Kiểm tra khung giờ có hợp lệ không
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        LocalTime endTime = LocalTime.parse(request.getEndTime());
        LocalTime pitchOpenTime = LocalTime.parse(pitch.getOpenTime());
        LocalTime pitchCloseTime = LocalTime.parse(pitch.getCloseTime());
        
        // Kiểm tra nếu là ngày hôm nay thì không được đặt khung giờ đã qua
        if (request.getBookingDate().equals(LocalDate.now())) {
            LocalTime now = LocalTime.now();
            if (startTime.isBefore(now)) {
                throw new RuntimeException("Không thể đặt sân cho khung giờ đã qua. Vui lòng chọn khung giờ sau " + now.format(DateTimeFormatter.ofPattern("HH:mm")));
            }
        }
        
        if (startTime.isBefore(pitchOpenTime) || endTime.isAfter(pitchCloseTime)) {
            throw new RuntimeException("Khung giờ không nằm trong giờ hoạt động của sân");
        }
        
        if (!endTime.isAfter(startTime)) {
            throw new RuntimeException("Giờ kết thúc phải sau giờ bắt đầu");
        }
        
        // Kiểm tra trùng giờ
        boolean isBooked = bookingRepository.isTimeSlotBooked(
                pitch, request.getBookingDate(), request.getStartTime(), request.getEndTime());
        
        if (isBooked) {
            throw new RuntimeException("Khung giờ này đã có người đặt, vui lòng chọn khung giờ khác");
        }
        
        // Tính giá tiền
        long hours = ChronoUnit.HOURS.between(startTime, endTime);
        BigDecimal totalPrice = pitch.getPricePerHour().multiply(BigDecimal.valueOf(hours));
        
        // Tạo booking
        Booking booking = new Booking();
        booking.setUser(currentUser);
        booking.setPitch(pitch);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setTotalPrice(totalPrice);
        booking.setPhoneNumber(request.getPhoneNumber());
        booking.setNote(request.getNote());
        booking.setStatus(BookingStatus.PENDING);
        
        Booking savedBooking = bookingRepository.save(booking);
        return convertToResponse(savedBooking);
    }
    
    /**
     * Lấy lịch đặt sân của user hiện tại
     */
    public List<BookingResponse> getMyBookings() {
        User currentUser = getCurrentUser();
        return bookingRepository.findByUserOrderByBookingDateDescCreatedAtDesc(currentUser)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách yêu cầu đặt sân cho chủ sân (OWNER)
     */
    public List<BookingResponse> getBookingsForOwner() {
        User currentUser = getCurrentUser();
        return bookingRepository.findByPitchOwner(currentUser)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách yêu cầu đặt sân theo status cho chủ sân
     */
    public List<BookingResponse> getBookingsForOwnerByStatus(BookingStatus status) {
        User currentUser = getCurrentUser();
        return bookingRepository.findByPitchOwnerAndStatus(currentUser, status)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Xác nhận đơn đặt sân (OWNER)
     */
    @Transactional
    public BookingResponse confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân"));
        
        User currentUser = getCurrentUser();
        
        // Kiểm tra quyền: chỉ owner của sân mới được xác nhận
        if (!booking.getPitch().getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền xác nhận đơn này");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể xác nhận đơn đang chờ duyệt");
        }
        
        booking.setStatus(BookingStatus.CONFIRMED);
        Booking updatedBooking = bookingRepository.save(booking);
        return convertToResponse(updatedBooking);
    }
    
    /**
     * Từ chối đơn đặt sân (OWNER)
     */
    @Transactional
    public BookingResponse rejectBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân"));
        
        User currentUser = getCurrentUser();
        
        // Kiểm tra quyền
        if (!booking.getPitch().getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền từ chối đơn này");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể từ chối đơn đang chờ duyệt");
        }
        
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectReason(reason);
        Booking updatedBooking = bookingRepository.save(booking);
        return convertToResponse(updatedBooking);
    }
    
    /**
     * Hủy đơn đặt sân (USER)
     * Chỉ cho phép hủy đơn ở trạng thái PENDING
     */
    @Transactional
    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân"));
        
        User currentUser = getCurrentUser();
        
        // Kiểm tra quyền: chỉ người đặt mới được hủy
        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền hủy đơn này");
        }
        
        // Chỉ cho phép hủy khi đơn đang PENDING (chưa được xác nhận)
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Không thể hủy đơn đã được xác nhận hoặc đã hoàn thành");
        }
        
        // Kiểm tra không được hủy nếu ngày đặt đã qua
        if (booking.getBookingDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Không thể hủy đơn đã qua ngày");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        Booking updatedBooking = bookingRepository.save(booking);
        return convertToResponse(updatedBooking);
    }
    
    /**
     * Lấy chi tiết một booking
     */
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân"));
        
        User currentUser = getCurrentUser();
        
        // Kiểm tra quyền: người đặt, chủ sân, hoặc admin
        boolean isOwner = booking.getUser().getId().equals(currentUser.getId());
        boolean isPitchOwner = booking.getPitch().getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
        
        if (!isOwner && !isPitchOwner && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền xem đơn này");
        }
        
        return convertToResponse(booking);
    }
    
    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    private BookingResponse convertToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        
        // User info
        response.setUserId(booking.getUser().getId());
        response.setUserName(booking.getUser().getFullName());
        response.setUserPhone(booking.getUser().getPhoneNumber());
        
        // Pitch info
        response.setPitchId(booking.getPitch().getId());
        response.setPitchName(booking.getPitch().getName());
        response.setPitchAddress(booking.getPitch().getAddress());
        response.setPitchType(booking.getPitch().getType().name());
        
        // Owner info
        response.setOwnerId(booking.getPitch().getOwner().getId());
        response.setOwnerName(booking.getPitch().getOwner().getFullName());
        response.setOwnerPhone(booking.getPitch().getOwner().getPhoneNumber());
        
        // Booking info
        response.setBookingDate(booking.getBookingDate());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setTotalPrice(booking.getTotalPrice());
        response.setStatus(booking.getStatus().name());
        response.setNote(booking.getNote());
        response.setRejectReason(booking.getRejectReason());
        response.setPhoneNumber(booking.getPhoneNumber());
        response.setCreatedAt(booking.getCreatedAt());
        
        return response;
    }
}
