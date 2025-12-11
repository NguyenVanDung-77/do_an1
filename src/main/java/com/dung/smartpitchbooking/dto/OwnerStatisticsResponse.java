package com.dung.smartpitchbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerStatisticsResponse {
    
    // Tổng quan
    private Integer totalPitches;           // Tổng số sân
    private Integer totalBookings;          // Tổng số booking
    private BigDecimal totalRevenue;        // Tổng doanh thu (CONFIRMED + COMPLETED)
    
    // Thống kê theo trạng thái booking
    private Integer pendingBookings;        // Đang chờ xác nhận
    private Integer confirmedBookings;      // Đã xác nhận
    private Integer completedBookings;      // Đã hoàn thành
    private Integer cancelledBookings;      // Đã hủy
    private Integer rejectedBookings;       // Đã từ chối
    
    // Thống kê tháng hiện tại
    private Integer thisMonthBookings;
    private BigDecimal thisMonthRevenue;
    
    // Thống kê hôm nay
    private Integer todayBookings;
    private BigDecimal todayRevenue;
    
    // Top sân được đặt nhiều nhất
    private List<PitchBookingStats> topPitches;
    
    // Doanh thu theo tháng (12 tháng gần nhất)
    private List<MonthlyRevenue> monthlyRevenues;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PitchBookingStats {
        private Long pitchId;
        private String pitchName;
        private Integer totalBookings;
        private BigDecimal totalRevenue;
        private Double avgRating;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private Integer year;
        private Integer month;
        private String monthName;
        private BigDecimal revenue;
        private Integer bookingCount;
    }
}
