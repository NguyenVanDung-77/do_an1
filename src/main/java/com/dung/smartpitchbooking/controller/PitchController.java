package com.dung.smartpitchbooking.controller;

import com.dung.smartpitchbooking.dto.PitchRequest;
import com.dung.smartpitchbooking.dto.PitchResponse;
import com.dung.smartpitchbooking.service.PitchService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pitches")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PitchController {
    
    @Autowired
    private PitchService pitchService;
    
    // Public - Xem tất cả sân đã được duyệt
    @GetMapping
    public ResponseEntity<List<PitchResponse>> getAllApprovedPitches() {
        List<PitchResponse> pitches = pitchService.getApprovedPitches();
        return ResponseEntity.ok(pitches);
    }
    
    // Public - Xem chi tiết một sân
    @GetMapping("/{id}")
    public ResponseEntity<?> getPitchById(@PathVariable Long id) {
        try {
            PitchResponse pitch = pitchService.getPitchById(id);
            return ResponseEntity.ok(pitch);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // OWNER, ADMIN - Tạo sân mới
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> createPitch(@Valid @RequestBody PitchRequest request) {
        try {
            PitchResponse pitch = pitchService.createPitch(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(pitch);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // OWNER, ADMIN - Sửa sân
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> updatePitch(@PathVariable Long id, 
                                         @Valid @RequestBody PitchRequest request) {
        try {
            PitchResponse pitch = pitchService.updatePitch(id, request);
            return ResponseEntity.ok(pitch);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // OWNER, ADMIN - Xóa sân
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> deletePitch(@PathVariable Long id) {
        try {
            pitchService.deletePitch(id);
            return ResponseEntity.ok("Xóa sân thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // OWNER - Xem sân của mình
    @GetMapping("/my-pitches")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<PitchResponse>> getMyPitches() {
        List<PitchResponse> pitches = pitchService.getMyPitches();
        return ResponseEntity.ok(pitches);
    }
    
    // ADMIN - Xem tất cả sân (kể cả chưa duyệt)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PitchResponse>> getAllPitchesForAdmin() {
        List<PitchResponse> pitches = pitchService.getAllPitches();
        return ResponseEntity.ok(pitches);
    }
    
    // ADMIN - Duyệt sân
    @PutMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approvePitch(@PathVariable Long id) {
        try {
            PitchResponse pitch = pitchService.approvePitch(id);
            return ResponseEntity.ok(pitch);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // ==================== TÌM KIẾM & LỌC ====================
    
    // Public - Tìm kiếm và lọc sân
    @GetMapping("/search")
    public ResponseEntity<List<PitchResponse>> searchPitches(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        List<PitchResponse> pitches = pitchService.searchPitches(keyword, city, district, type, minPrice, maxPrice);
        return ResponseEntity.ok(pitches);
    }
    
    // Public - Lấy danh sách thành phố
    @GetMapping("/cities")
    public ResponseEntity<List<String>> getCities() {
        List<String> cities = pitchService.getCities();
        return ResponseEntity.ok(cities);
    }
    
    // Public - Lấy danh sách quận theo thành phố
    @GetMapping("/districts")
    public ResponseEntity<List<String>> getDistrictsByCity(@RequestParam String city) {
        List<String> districts = pitchService.getDistrictsByCity(city);
        return ResponseEntity.ok(districts);
    }
    
    // Public - Lấy khoảng giá min-max
    @GetMapping("/price-range")
    public ResponseEntity<Map<String, BigDecimal>> getPriceRange() {
        Map<String, BigDecimal> priceRange = pitchService.getPriceRange();
        return ResponseEntity.ok(priceRange);
    }
}
