package com.dung.smartpitchbooking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Người đặt sân
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pitch_id", nullable = false)
    private Pitch pitch; // Sân được đặt
    
    @Column(nullable = false)
    private LocalDate bookingDate; // Ngày đặt sân (VD: 2025-12-05)
    
    @Column(nullable = false)
    private String startTime; // Giờ bắt đầu (VD: "18:00")
    
    @Column(nullable = false)
    private String endTime; // Giờ kết thúc (VD: "19:00")
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice; // Tổng tiền
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String note; // Ghi chú của người đặt
    
    @Column(columnDefinition = "TEXT")
    private String rejectReason; // Lý do từ chối (nếu có)
    
    @Column(nullable = false)
    private String phoneNumber; // SĐT liên hệ
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    public enum BookingStatus {
        PENDING,    // Chờ xác nhận
        CONFIRMED,  // Đã xác nhận
        REJECTED,   // Bị từ chối
        CANCELLED,  // Người dùng hủy
        COMPLETED   // Đã hoàn thành
    }
}
