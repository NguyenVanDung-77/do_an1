package com.dung.smartpitchbooking.repository;

import com.dung.smartpitchbooking.entity.Booking;
import com.dung.smartpitchbooking.entity.Booking.BookingStatus;
import com.dung.smartpitchbooking.entity.Pitch;
import com.dung.smartpitchbooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // Lấy tất cả booking của một user
    List<Booking> findByUserOrderByBookingDateDescCreatedAtDesc(User user);
    
    // Lấy booking theo user và status
    List<Booking> findByUserAndStatusOrderByBookingDateDesc(User user, BookingStatus status);
    
    // Lấy tất cả booking của một sân (cho chủ sân)
    List<Booking> findByPitchOrderByBookingDateDescCreatedAtDesc(Pitch pitch);
    
    // Lấy tất cả booking của các sân thuộc một owner
    @Query("SELECT b FROM Booking b WHERE b.pitch.owner = :owner ORDER BY b.bookingDate DESC, b.createdAt DESC")
    List<Booking> findByPitchOwner(@Param("owner") User owner);
    
    // Lấy booking theo owner và status
    @Query("SELECT b FROM Booking b WHERE b.pitch.owner = :owner AND b.status = :status ORDER BY b.bookingDate DESC")
    List<Booking> findByPitchOwnerAndStatus(@Param("owner") User owner, @Param("status") BookingStatus status);
    
    // Lấy booking của một sân trong một ngày cụ thể (để kiểm tra trùng giờ)
    List<Booking> findByPitchAndBookingDateAndStatusIn(Pitch pitch, LocalDate bookingDate, List<BookingStatus> statuses);
    
    // Kiểm tra xem khung giờ đã được đặt chưa (PENDING hoặc CONFIRMED)
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.pitch = :pitch AND b.bookingDate = :date " +
           "AND b.status IN ('PENDING', 'CONFIRMED') " +
           "AND ((b.startTime <= :startTime AND b.endTime > :startTime) " +
           "OR (b.startTime < :endTime AND b.endTime >= :endTime) " +
           "OR (b.startTime >= :startTime AND b.endTime <= :endTime))")
    boolean isTimeSlotBooked(@Param("pitch") Pitch pitch, 
                             @Param("date") LocalDate date,
                             @Param("startTime") String startTime, 
                             @Param("endTime") String endTime);
    
    // Lấy danh sách booking đã đặt trong ngày (để hiển thị khung giờ đã đặt)
    @Query("SELECT b FROM Booking b WHERE b.pitch.id = :pitchId AND b.bookingDate = :date " +
           "AND b.status IN ('PENDING', 'CONFIRMED')")
    List<Booking> findBookedSlots(@Param("pitchId") Long pitchId, @Param("date") LocalDate date);
    
    // Kiểm tra user đã có booking với sân này và status nào đó chưa (dùng cho review)
    boolean existsByUserAndPitchAndStatusIn(User user, Pitch pitch, List<BookingStatus> statuses);
    
    // Lấy booking theo status (dùng cho scheduler)
    List<Booking> findByStatus(BookingStatus status);
}
