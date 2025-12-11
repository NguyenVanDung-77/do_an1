package com.dung.smartpitchbooking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pitches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pitch {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String address;
    
    private String city;
    
    private String district;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PitchType type;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerHour;
    
    @Column(columnDefinition = "TEXT")
    private String images; // Lưu URLs của ảnh, phân cách bởi dấu phẩy
    
    @Column(nullable = false)
    private String openTime; // Ví dụ: "06:00"
    
    @Column(nullable = false)
    private String closeTime; // Ví dụ: "22:00"
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(nullable = false)
    private Boolean isApproved = false; // Cần admin duyệt
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    public enum PitchType {
        PITCH_5,   // Sân 5 người
        PITCH_7,   // Sân 7 người
        PITCH_11   // Sân 11 người
    }
}
