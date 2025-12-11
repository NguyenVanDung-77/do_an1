package com.dung.smartpitchbooking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {
    
    @NotNull(message = "Pitch ID không được để trống")
    private Long pitchId;
    
    @NotNull(message = "Ngày đặt không được để trống")
    private LocalDate bookingDate;
    
    @NotBlank(message = "Giờ bắt đầu không được để trống")
    private String startTime; // "18:00"
    
    @NotBlank(message = "Giờ kết thúc không được để trống")
    private String endTime; // "19:00"
    
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;
    
    private String note; // Ghi chú (tùy chọn)
}
