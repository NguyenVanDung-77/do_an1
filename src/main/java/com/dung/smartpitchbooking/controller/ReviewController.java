package com.dung.smartpitchbooking.controller;

import com.dung.smartpitchbooking.dto.ReviewRequest;
import com.dung.smartpitchbooking.dto.ReviewResponse;
import com.dung.smartpitchbooking.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReviewController {
    
    @Autowired
    private ReviewService reviewService;
    
    // Public - Lấy tất cả review của một sân
    @GetMapping("/pitch/{pitchId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByPitch(@PathVariable Long pitchId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByPitchId(pitchId);
        return ResponseEntity.ok(reviews);
    }
    
    // Public - Lấy thông tin tổng hợp đánh giá (rating trung bình, số lượng)
    @GetMapping("/pitch/{pitchId}/summary")
    public ResponseEntity<Map<String, Object>> getReviewSummary(@PathVariable Long pitchId) {
        Map<String, Object> summary = reviewService.getReviewSummary(pitchId);
        return ResponseEntity.ok(summary);
    }
    
    // USER - Kiểm tra user đã đánh giá sân này chưa
    @GetMapping("/pitch/{pitchId}/check")
    @PreAuthorize("hasAnyRole('USER', 'OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> checkUserReview(@PathVariable Long pitchId) {
        Map<String, Object> result = reviewService.checkUserReview(pitchId);
        return ResponseEntity.ok(result);
    }
    
    // USER - Tạo hoặc cập nhật đánh giá
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'OWNER', 'ADMIN')")
    public ResponseEntity<?> createOrUpdateReview(@Valid @RequestBody ReviewRequest request) {
        try {
            ReviewResponse review = reviewService.createOrUpdateReview(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // USER - Xóa đánh giá của mình
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'OWNER', 'ADMIN')")
    public ResponseEntity<?> deleteMyReview(@PathVariable Long id) {
        try {
            reviewService.deleteMyReview(id);
            return ResponseEntity.ok("Đã xóa đánh giá thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // ADMIN - Xóa đánh giá bất kỳ
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReviewByAdmin(@PathVariable Long id) {
        try {
            reviewService.deleteReviewByAdmin(id);
            return ResponseEntity.ok("Đã xóa đánh giá thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
