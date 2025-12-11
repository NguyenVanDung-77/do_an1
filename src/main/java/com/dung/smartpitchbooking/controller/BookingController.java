package com.dung.smartpitchbooking.controller;

import com.dung.smartpitchbooking.dto.BookingRequest;
import com.dung.smartpitchbooking.dto.BookingResponse;
import com.dung.smartpitchbooking.dto.TimeSlotResponse;
import com.dung.smartpitchbooking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {
    
    @Autowired
    private BookingService bookingService;
    
    /**
     * Lấy danh sách khung giờ còn trống của một sân trong ngày
     * Public API - ai cũng có thể xem
     */
    @GetMapping("/available-slots/{pitchId}")
    public ResponseEntity<List<TimeSlotResponse>> getAvailableTimeSlots(
            @PathVariable Long pitchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<TimeSlotResponse> slots = bookingService.getAvailableTimeSlots(pitchId, date);
        return ResponseEntity.ok(slots);
    }
    
    /**
     * Đặt sân - USER đăng nhập mới được đặt
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest request) {
        try {
            BookingResponse booking = bookingService.createBooking(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Lấy lịch đặt sân của user hiện tại
     */
    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        List<BookingResponse> bookings = bookingService.getMyBookings();
        return ResponseEntity.ok(bookings);
    }
    
    /**
     * Lấy chi tiết một đơn đặt sân
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            BookingResponse booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Hủy đơn đặt sân (USER)
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            BookingResponse booking = bookingService.cancelBooking(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // ===================== OWNER APIs =====================
    
    /**
     * Lấy danh sách đơn đặt sân của các sân thuộc OWNER
     */
    @GetMapping("/owner/all")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<BookingResponse>> getBookingsForOwner() {
        List<BookingResponse> bookings = bookingService.getBookingsForOwner();
        return ResponseEntity.ok(bookings);
    }
    
    /**
     * Lấy danh sách đơn đang chờ duyệt (PENDING) của OWNER
     */
    @GetMapping("/owner/pending")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<BookingResponse>> getPendingBookingsForOwner() {
        List<BookingResponse> bookings = bookingService.getBookingsForOwnerByStatus(
                com.dung.smartpitchbooking.entity.Booking.BookingStatus.PENDING);
        return ResponseEntity.ok(bookings);
    }
    
    /**
     * Xác nhận đơn đặt sân (OWNER)
     */
    @PutMapping("/owner/{id}/confirm")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> confirmBooking(@PathVariable Long id) {
        try {
            BookingResponse booking = bookingService.confirmBooking(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Từ chối đơn đặt sân (OWNER)
     */
    @PutMapping("/owner/{id}/reject")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = body != null ? body.get("reason") : null;
            BookingResponse booking = bookingService.rejectBooking(id, reason);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
