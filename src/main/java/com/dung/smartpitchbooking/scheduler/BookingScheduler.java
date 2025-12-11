package com.dung.smartpitchbooking.scheduler;

import com.dung.smartpitchbooking.entity.Booking;
import com.dung.smartpitchbooking.entity.Booking.BookingStatus;
import com.dung.smartpitchbooking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler tự động cập nhật trạng thái booking
 * - CONFIRMED → COMPLETED: Khi thời gian đá đã kết thúc
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingScheduler {
    
    private final BookingRepository bookingRepository;
    
    /**
     * Chạy mỗi 5 phút để kiểm tra và cập nhật booking đã hoàn thành
     * Cron: giây phút giờ ngày tháng thứ
     */
    @Scheduled(cron = "0 */5 * * * *") // Mỗi 5 phút
    @Transactional
    public void autoCompleteBookings() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        String currentTime = String.format("%02d:%02d", now.getHour(), now.getMinute());
        
        log.info("🔄 Running auto-complete bookings check at {}", now);
        
        // Lấy tất cả booking CONFIRMED
        List<Booking> confirmedBookings = bookingRepository.findByStatus(BookingStatus.CONFIRMED);
        
        int completedCount = 0;
        for (Booking booking : confirmedBookings) {
            // Kiểm tra nếu booking đã qua thời gian kết thúc
            if (isBookingCompleted(booking, today, currentTime)) {
                booking.setStatus(BookingStatus.COMPLETED);
                bookingRepository.save(booking);
                completedCount++;
                
                log.info("✅ Auto-completed booking #{} - Pitch: {}, Date: {}, Time: {}-{}", 
                    booking.getId(),
                    booking.getPitch().getName(),
                    booking.getBookingDate(),
                    booking.getStartTime(),
                    booking.getEndTime()
                );
            }
        }
        
        if (completedCount > 0) {
            log.info("📊 Auto-completed {} bookings", completedCount);
        }
    }
    
    /**
     * Kiểm tra booking đã hoàn thành chưa
     * - Ngày booking < hôm nay → Completed
     * - Ngày booking = hôm nay AND giờ kết thúc <= giờ hiện tại → Completed
     */
    private boolean isBookingCompleted(Booking booking, LocalDate today, String currentTime) {
        LocalDate bookingDate = booking.getBookingDate();
        
        // Nếu ngày đặt trước hôm nay → đã hoàn thành
        if (bookingDate.isBefore(today)) {
            return true;
        }
        
        // Nếu ngày đặt là hôm nay, kiểm tra giờ kết thúc
        if (bookingDate.equals(today)) {
            String endTime = booking.getEndTime(); // VD: "19:00"
            return endTime.compareTo(currentTime) <= 0;
        }
        
        return false;
    }
}
