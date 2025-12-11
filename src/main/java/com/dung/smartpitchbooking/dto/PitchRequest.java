package com.dung.smartpitchbooking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PitchRequest {
    
    @NotBlank(message = "Tên sân không được để trống")
    private String name;
    
    private String description;
    
    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;
    
    private String city;
    
    private String district;
    
    @NotBlank(message = "Loại sân không được để trống")
    private String type; // PITCH_5, PITCH_7, PITCH_11
    
    @NotNull(message = "Giá thuê không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá thuê phải lớn hơn 0")
    private BigDecimal pricePerHour;
    
    private String images;
    
    @NotBlank(message = "Giờ mở cửa không được để trống")
    private String openTime; // HH:mm
    
    @NotBlank(message = "Giờ đóng cửa không được để trống")
    private String closeTime; // HH:mm
}
