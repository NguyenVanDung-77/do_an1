package com.dung.smartpitchbooking.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingResponse {
    private Long id;
    
    // Thông tin người đặt
    private Long userId;
    private String userName;
    private String userPhone;
    
    // Thông tin sân
    private Long pitchId;
    private String pitchName;
    private String pitchAddress;
    private String pitchType;
    
    // Thông tin chủ sân
    private Long ownerId;
    private String ownerName;
    private String ownerPhone;
    
    // Thông tin đặt sân
    private LocalDate bookingDate;
    private String startTime;
    private String endTime;
    private BigDecimal totalPrice;
    private String status;
    private String note;
    private String rejectReason;
    private String phoneNumber;
    
    private LocalDateTime createdAt;
}
