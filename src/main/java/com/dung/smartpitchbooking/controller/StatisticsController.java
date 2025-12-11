package com.dung.smartpitchbooking.controller;

import com.dung.smartpitchbooking.dto.AdminStatsResponse;
import com.dung.smartpitchbooking.dto.OwnerStatisticsResponse;
import com.dung.smartpitchbooking.entity.User;
import com.dung.smartpitchbooking.repository.UserRepository;
import com.dung.smartpitchbooking.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    
    private final StatisticsService statisticsService;
    private final UserRepository userRepository;
    
    /**
     * Lấy thống kê cho Owner
     * GET /api/statistics/owner
     */
    @GetMapping("/owner")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<OwnerStatisticsResponse> getOwnerStatistics(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User owner = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        OwnerStatisticsResponse stats = statisticsService.getOwnerStatistics(owner);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Lấy thống kê cho Admin
     * GET /api/statistics/admin
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminStatsResponse> getAdminStatistics() {
        AdminStatsResponse stats = statisticsService.getAdminStatistics();
        return ResponseEntity.ok(stats);
    }
}
