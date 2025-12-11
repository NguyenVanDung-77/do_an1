package com.dung.smartpitchbooking.repository;

import com.dung.smartpitchbooking.entity.Pitch;
import com.dung.smartpitchbooking.entity.Review;
import com.dung.smartpitchbooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Lấy tất cả review của một sân, sắp xếp theo thời gian mới nhất
    List<Review> findByPitchOrderByCreatedAtDesc(Pitch pitch);
    
    // Lấy review của một sân theo id
    List<Review> findByPitchIdOrderByCreatedAtDesc(Long pitchId);
    
    // Kiểm tra user đã review sân này chưa
    Optional<Review> findByUserAndPitch(User user, Pitch pitch);
    
    // Kiểm tra user đã review sân này chưa (theo id)
    boolean existsByUserIdAndPitchId(Long userId, Long pitchId);
    
    // Tính rating trung bình của sân
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.pitch.id = :pitchId")
    Double getAverageRatingByPitchId(@Param("pitchId") Long pitchId);
    
    // Đếm số lượng review của sân
    Long countByPitchId(Long pitchId);
    
    // Lấy review của user cho sân cụ thể
    Optional<Review> findByUserIdAndPitchId(Long userId, Long pitchId);
    
    // Lấy tất cả review của user
    List<Review> findByUserOrderByCreatedAtDesc(User user);
}
