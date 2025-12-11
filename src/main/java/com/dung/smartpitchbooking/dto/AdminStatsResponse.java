package com.dung.smartpitchbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    
    // Tổng quan hệ thống
    private Long totalUsers;
    private Long totalOwners;
    private Long totalAdmins;
    private Long activeUsers;
    private Long inactiveUsers;
    
    private Long totalPitches;
    private Long activePitches;
    
    private Long totalBookings;
    private BigDecimal totalRevenue;
    
    // Thống kê tháng này
    private Long thisMonthUsers;
    private Long thisMonthBookings;
    private BigDecimal thisMonthRevenue;
    
    // Thống kê hôm nay
    private Long todayBookings;
    private BigDecimal todayRevenue;
}
