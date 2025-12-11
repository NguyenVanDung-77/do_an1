package com.dung.smartpitchbooking.service;

import com.dung.smartpitchbooking.dto.ReviewRequest;
import com.dung.smartpitchbooking.dto.ReviewResponse;
import com.dung.smartpitchbooking.entity.Booking;
import com.dung.smartpitchbooking.entity.Pitch;
import com.dung.smartpitchbooking.entity.Review;
import com.dung.smartpitchbooking.entity.User;
import com.dung.smartpitchbooking.repository.BookingRepository;
import com.dung.smartpitchbooking.repository.PitchRepository;
import com.dung.smartpitchbooking.repository.ReviewRepository;
import com.dung.smartpitchbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private PitchRepository pitchRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    /**
     * Tạo hoặc cập nhật đánh giá
     */
    @Transactional
    public ReviewResponse createOrUpdateReview(ReviewRequest request) {
        User currentUser = getCurrentUser();
        
        Pitch pitch = pitchRepository.findById(request.getPitchId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sân"));
        
        // Kiểm tra user đã từng đặt sân này và có booking CONFIRMED hoặc COMPLETED chưa
        boolean hasBooking = bookingRepository.existsByUserAndPitchAndStatusIn(
                currentUser, pitch, 
                List.of(Booking.BookingStatus.CONFIRMED, Booking.BookingStatus.COMPLETED)
        );
        
        if (!hasBooking) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sân sau khi đã đặt và được xác nhận");
        }
        
        // Kiểm tra xem đã có review chưa
        Optional<Review> existingReview = reviewRepository.findByUserAndPitch(currentUser, pitch);
        
        Review review;
        if (existingReview.isPresent()) {
            // Cập nhật review cũ
            review = existingReview.get();
            review.setRating(request.getRating());
            review.setComment(request.getComment());
        } else {
            // Tạo review mới
            review = new Review();
            review.setUser(currentUser);
            review.setPitch(pitch);
            review.setRating(request.getRating());
            review.setComment(request.getComment());
        }
        
        Review savedReview = reviewRepository.save(review);
        return convertToResponse(savedReview);
    }
    
    /**
     * Lấy tất cả đánh giá của một sân
     */
    public List<ReviewResponse> getReviewsByPitchId(Long pitchId) {
        return reviewRepository.findByPitchIdOrderByCreatedAtDesc(pitchId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy thông tin tổng hợp đánh giá của sân
     */
    public Map<String, Object> getReviewSummary(Long pitchId) {
        Map<String, Object> summary = new HashMap<>();
        
        Double avgRating = reviewRepository.getAverageRatingByPitchId(pitchId);
        Long totalReviews = reviewRepository.countByPitchId(pitchId);
        
        summary.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0);
        summary.put("totalReviews", totalReviews);
        
        return summary;
    }
    
    /**
     * Kiểm tra user đã đánh giá sân này chưa
     */
    public Map<String, Object> checkUserReview(Long pitchId) {
        User currentUser = getCurrentUser();
        Map<String, Object> result = new HashMap<>();
        
        Optional<Review> review = reviewRepository.findByUserIdAndPitchId(currentUser.getId(), pitchId);
        result.put("hasReviewed", review.isPresent());
        
        if (review.isPresent()) {
            result.put("review", convertToResponse(review.get()));
        }
        
        // Kiểm tra user có được phép review không (đã có booking confirmed)
        Pitch pitch = pitchRepository.findById(pitchId).orElse(null);
        if (pitch != null) {
            boolean canReview = bookingRepository.existsByUserAndPitchAndStatusIn(
                    currentUser, pitch,
                    List.of(Booking.BookingStatus.CONFIRMED, Booking.BookingStatus.COMPLETED)
            );
            result.put("canReview", canReview);
        } else {
            result.put("canReview", false);
        }
        
        return result;
    }
    
    /**
     * Xóa đánh giá của mình
     */
    @Transactional
    public void deleteMyReview(Long reviewId) {
        User currentUser = getCurrentUser();
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));
        
        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa đánh giá này");
        }
        
        reviewRepository.delete(review);
    }
    
    /**
     * Admin xóa đánh giá bất kỳ
     */
    @Transactional
    public void deleteReviewByAdmin(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));
        reviewRepository.delete(review);
    }
    
    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    private ReviewResponse convertToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setPitchId(review.getPitch().getId());
        response.setPitchName(review.getPitch().getName());
        response.setUserId(review.getUser().getId());
        response.setUserName(review.getUser().getFullName());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        return response;
    }
}
