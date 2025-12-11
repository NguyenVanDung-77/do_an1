package com.dung.smartpitchbooking.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TimeSlotResponse {
    private Long id;
    private String startTime;
    private String endTime;
    private BigDecimal price;
    private Boolean isBooked; // true nếu đã có người đặt trong ngày được chọn
}
