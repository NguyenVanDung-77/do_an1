package com.dung.smartpitchbooking.repository;

import com.dung.smartpitchbooking.entity.Pitch;
import com.dung.smartpitchbooking.entity.Pitch.PitchType;
import com.dung.smartpitchbooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PitchRepository extends JpaRepository<Pitch, Long> {
    
    List<Pitch> findByOwner(User owner);
    
    List<Pitch> findByIsApprovedTrue();
    
    List<Pitch> findByIsApprovedFalse();
    
    List<Pitch> findByTypeAndIsApprovedTrue(PitchType type);
    
    List<Pitch> findByCityContainingIgnoreCaseAndIsApprovedTrue(String city);
    
    // Tìm kiếm và lọc sân với nhiều điều kiện
    @Query("SELECT p FROM Pitch p WHERE p.isApproved = true " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "    OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:city IS NULL OR :city = '' OR p.city = :city) " +
           "AND (:district IS NULL OR :district = '' OR p.district = :district) " +
           "AND (:type IS NULL OR p.type = :type) " +
           "AND (:minPrice IS NULL OR p.pricePerHour >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.pricePerHour <= :maxPrice) " +
           "ORDER BY p.createdAt DESC")
    List<Pitch> searchPitches(
            @Param("keyword") String keyword,
            @Param("city") String city,
            @Param("district") String district,
            @Param("type") PitchType type,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice
    );
    
    // Lấy danh sách thành phố có sân
    @Query("SELECT DISTINCT p.city FROM Pitch p WHERE p.isApproved = true AND p.city IS NOT NULL ORDER BY p.city")
    List<String> findDistinctCities();
    
    // Lấy danh sách quận theo thành phố
    @Query("SELECT DISTINCT p.district FROM Pitch p WHERE p.isApproved = true AND p.city = :city AND p.district IS NOT NULL ORDER BY p.district")
    List<String> findDistrictsByCity(@Param("city") String city);
    
    // Lấy giá min và max
    @Query("SELECT MIN(p.pricePerHour) FROM Pitch p WHERE p.isApproved = true")
    BigDecimal findMinPrice();
    
    @Query("SELECT MAX(p.pricePerHour) FROM Pitch p WHERE p.isApproved = true")
    BigDecimal findMaxPrice();
}
