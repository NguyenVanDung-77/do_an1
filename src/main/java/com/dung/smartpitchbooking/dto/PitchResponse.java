package com.dung.smartpitchbooking.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PitchResponse {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String district;
    private String type;
    private BigDecimal pricePerHour;
    private String images;
    private String openTime;
    private String closeTime;
    private Long ownerId;
    private String ownerName;
    private Boolean isActive;
    private Boolean isApproved;
    private LocalDateTime createdAt;
}
