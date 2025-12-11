package com.dung.smartpitchbooking.service;

import com.dung.smartpitchbooking.dto.AdminStatsResponse;
import com.dung.smartpitchbooking.dto.OwnerStatisticsResponse;
import com.dung.smartpitchbooking.dto.OwnerStatisticsResponse.MonthlyRevenue;
import com.dung.smartpitchbooking.dto.OwnerStatisticsResponse.PitchBookingStats;
import com.dung.smartpitchbooking.entity.Booking;
import com.dung.smartpitchbooking.entity.Booking.BookingStatus;
import com.dung.smartpitchbooking.entity.Pitch;
import com.dung.smartpitchbooking.entity.User;
import com.dung.smartpitchbooking.repository.BookingRepository;
import com.dung.smartpitchbooking.repository.PitchRepository;
import com.dung.smartpitchbooking.repository.ReviewRepository;
import com.dung.smartpitchbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    
    private final BookingRepository bookingRepository;
    private final PitchRepository pitchRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    
    /**
     * Lấy thống kê tổng quan cho Owner
     */
    public OwnerStatisticsResponse getOwnerStatistics(User owner) {
        // Lấy danh sách sân của owner
        List<Pitch> ownerPitches = pitchRepository.findByOwner(owner);
        
        // Lấy tất cả booking của owner
        List<Booking> allBookings = bookingRepository.findByPitchOwner(owner);
        
        // Tính các chỉ số
        int totalPitches = ownerPitches.size();
        int totalBookings = allBookings.size();
        
        // Thống kê theo trạng thái
        Map<BookingStatus, Long> statusCount = allBookings.stream()
                .collect(Collectors.groupingBy(Booking::getStatus, Collectors.counting()));
        
        int pendingBookings = statusCount.getOrDefault(BookingStatus.PENDING, 0L).intValue();
        int confirmedBookings = statusCount.getOrDefault(BookingStatus.CONFIRMED, 0L).intValue();
        int completedBookings = statusCount.getOrDefault(BookingStatus.COMPLETED, 0L).intValue();
        int cancelledBookings = statusCount.getOrDefault(BookingStatus.CANCELLED, 0L).intValue();
        int rejectedBookings = statusCount.getOrDefault(BookingStatus.REJECTED, 0L).intValue();
        
        // Tính tổng doanh thu (chỉ tính CONFIRMED và COMPLETED)
        BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Thống kê tháng hiện tại
        LocalDate now = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(now);
        
        List<Booking> thisMonthBookingsList = allBookings.stream()
                .filter(b -> YearMonth.from(b.getBookingDate()).equals(currentMonth))
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.toList());
        
        int thisMonthBookings = thisMonthBookingsList.size();
        BigDecimal thisMonthRevenue = thisMonthBookingsList.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Thống kê hôm nay
        List<Booking> todayBookingsList = allBookings.stream()
                .filter(b -> b.getBookingDate().equals(now))
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.toList());
        
        int todayBookings = todayBookingsList.size();
        BigDecimal todayRevenue = todayBookingsList.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Top sân được đặt nhiều nhất
        List<PitchBookingStats> topPitches = getTopPitches(ownerPitches, allBookings);
        
        // Doanh thu 12 tháng gần nhất
        List<MonthlyRevenue> monthlyRevenues = getMonthlyRevenues(allBookings);
        
        return OwnerStatisticsResponse.builder()
                .totalPitches(totalPitches)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .pendingBookings(pendingBookings)
                .confirmedBookings(confirmedBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .rejectedBookings(rejectedBookings)
                .thisMonthBookings(thisMonthBookings)
                .thisMonthRevenue(thisMonthRevenue)
                .todayBookings(todayBookings)
                .todayRevenue(todayRevenue)
                .topPitches(topPitches)
                .monthlyRevenues(monthlyRevenues)
                .build();
    }
    
    /**
     * Top sân được đặt nhiều nhất
     */
    private List<PitchBookingStats> getTopPitches(List<Pitch> pitches, List<Booking> allBookings) {
        Map<Long, List<Booking>> bookingsByPitch = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.groupingBy(b -> b.getPitch().getId()));
        
        return pitches.stream()
                .map(pitch -> {
                    List<Booking> pitchBookings = bookingsByPitch.getOrDefault(pitch.getId(), Collections.emptyList());
                    int totalBookingsCount = pitchBookings.size();
                    BigDecimal revenue = pitchBookings.stream()
                            .map(Booking::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    Double avgRating = reviewRepository.getAverageRatingByPitchId(pitch.getId());
                    
                    return PitchBookingStats.builder()
                            .pitchId(pitch.getId())
                            .pitchName(pitch.getName())
                            .totalBookings(totalBookingsCount)
                            .totalRevenue(revenue)
                            .avgRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null)
                            .build();
                })
                .sorted((a, b) -> b.getTotalBookings().compareTo(a.getTotalBookings()))
                .limit(5)
                .collect(Collectors.toList());
    }
    
    /**
     * Doanh thu 12 tháng gần nhất
     */
    private List<MonthlyRevenue> getMonthlyRevenues(List<Booking> allBookings) {
        List<MonthlyRevenue> result = new ArrayList<>();
        YearMonth current = YearMonth.now();
        
        for (int i = 11; i >= 0; i--) {
            YearMonth month = current.minusMonths(i);
            final YearMonth targetMonth = month;
            
            List<Booking> monthBookings = allBookings.stream()
                    .filter(b -> YearMonth.from(b.getBookingDate()).equals(targetMonth))
                    .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                    .collect(Collectors.toList());
            
            BigDecimal revenue = monthBookings.stream()
                    .map(Booking::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            String monthName = month.getMonth().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("vi"));
            
            result.add(MonthlyRevenue.builder()
                    .year(month.getYear())
                    .month(month.getMonthValue())
                    .monthName(monthName + "/" + month.getYear())
                    .revenue(revenue)
                    .bookingCount(monthBookings.size())
                    .build());
        }
        
        return result;
    }
    
    /**
     * Lấy thống kê tổng quan cho Admin
     */
    public AdminStatsResponse getAdminStatistics() {
        // Đếm users theo role và trạng thái
        List<User> allUsers = userRepository.findAll();
        
        long totalUsers = allUsers.stream()
                .filter(u -> u.getRole() == User.Role.USER)
                .count();
        long totalOwners = allUsers.stream()
                .filter(u -> u.getRole() == User.Role.OWNER)
                .count();
        long totalAdmins = allUsers.stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .count();
        long activeUsers = allUsers.stream()
                .filter(User::getIsActive)
                .count();
        long inactiveUsers = allUsers.stream()
                .filter(u -> !u.getIsActive())
                .count();
        
        // Pitches
        List<Pitch> allPitches = pitchRepository.findAll();
        long totalPitches = allPitches.size();
        long activePitches = allPitches.stream()
                .filter(Pitch::getIsActive)
                .count();
        
        // Bookings
        List<Booking> allBookings = bookingRepository.findAll();
        long totalBookings = allBookings.size();
        
        BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Thống kê tháng này
        LocalDate now = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(now);
        
        long thisMonthUsers = allUsers.stream()
                .filter(u -> YearMonth.from(u.getCreatedAt().toLocalDate()).equals(currentMonth))
                .count();
        
        List<Booking> thisMonthBookingsList = allBookings.stream()
                .filter(b -> YearMonth.from(b.getBookingDate()).equals(currentMonth))
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.toList());
        
        long thisMonthBookings = thisMonthBookingsList.size();
        BigDecimal thisMonthRevenue = thisMonthBookingsList.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Thống kê hôm nay
        List<Booking> todayBookingsList = allBookings.stream()
                .filter(b -> b.getBookingDate().equals(now))
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.toList());
        
        long todayBookings = todayBookingsList.size();
        BigDecimal todayRevenue = todayBookingsList.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalOwners(totalOwners)
                .totalAdmins(totalAdmins)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .totalPitches(totalPitches)
                .activePitches(activePitches)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .thisMonthUsers(thisMonthUsers)
                .thisMonthBookings(thisMonthBookings)
                .thisMonthRevenue(thisMonthRevenue)
                .todayBookings(todayBookings)
                .todayRevenue(todayRevenue)
                .build();
    }
}
