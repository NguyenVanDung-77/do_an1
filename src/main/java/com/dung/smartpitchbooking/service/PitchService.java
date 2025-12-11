package com.dung.smartpitchbooking.service;

import com.dung.smartpitchbooking.dto.PitchRequest;
import com.dung.smartpitchbooking.dto.PitchResponse;
import com.dung.smartpitchbooking.entity.Pitch;
import com.dung.smartpitchbooking.entity.User;
import com.dung.smartpitchbooking.repository.PitchRepository;
import com.dung.smartpitchbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PitchService {
    
    @Autowired
    private PitchRepository pitchRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public PitchResponse createPitch(PitchRequest request) {
        User owner = getCurrentUser();
        
        Pitch pitch = new Pitch();
        pitch.setName(request.getName());
        pitch.setDescription(request.getDescription());
        pitch.setAddress(request.getAddress());
        pitch.setCity(request.getCity());
        pitch.setDistrict(request.getDistrict());
        pitch.setType(Pitch.PitchType.valueOf(request.getType()));
        pitch.setPricePerHour(request.getPricePerHour());
        pitch.setImages(request.getImages());
        pitch.setOpenTime(request.getOpenTime());
        pitch.setCloseTime(request.getCloseTime());
        pitch.setOwner(owner);
        pitch.setIsActive(true);
        pitch.setIsApproved(false); // Chờ admin duyệt
        
        Pitch savedPitch = pitchRepository.save(pitch);
        return convertToResponse(savedPitch);
    }
    
    public PitchResponse updatePitch(Long id, PitchRequest request) {
        Pitch pitch = pitchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sân"));
        
        User currentUser = getCurrentUser();
        
        // Kiểm tra quyền: chỉ owner hoặc admin mới được sửa
        if (!pitch.getOwner().getId().equals(currentUser.getId()) && 
            !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Bạn không có quyền sửa sân này");
        }
        
        pitch.setName(request.getName());
        pitch.setDescription(request.getDescription());
        pitch.setAddress(request.getAddress());
        pitch.setCity(request.getCity());
        pitch.setDistrict(request.getDistrict());
        pitch.setType(Pitch.PitchType.valueOf(request.getType()));
        pitch.setPricePerHour(request.getPricePerHour());
        pitch.setImages(request.getImages());
        pitch.setOpenTime(request.getOpenTime());
        pitch.setCloseTime(request.getCloseTime());
        
        Pitch updatedPitch = pitchRepository.save(pitch);
        return convertToResponse(updatedPitch);
    }
    
    public void deletePitch(Long id) {
        Pitch pitch = pitchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sân"));
        
        User currentUser = getCurrentUser();
        
        // Kiểm tra quyền: chỉ owner hoặc admin mới được xóa
        if (!pitch.getOwner().getId().equals(currentUser.getId()) && 
            !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Bạn không có quyền xóa sân này");
        }
        
        pitchRepository.delete(pitch);
    }
    
    public PitchResponse getPitchById(Long id) {
        Pitch pitch = pitchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sân"));
        return convertToResponse(pitch);
    }
    
    public List<PitchResponse> getAllPitches() {
        return pitchRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<PitchResponse> getApprovedPitches() {
        return pitchRepository.findByIsApprovedTrue().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<PitchResponse> getMyPitches() {
        User owner = getCurrentUser();
        return pitchRepository.findByOwner(owner).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public PitchResponse approvePitch(Long id) {
        Pitch pitch = pitchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sân"));
        
        pitch.setIsApproved(true);
        Pitch approvedPitch = pitchRepository.save(pitch);
        return convertToResponse(approvedPitch);
    }
    
    /**
     * Tìm kiếm và lọc sân
     */
    public List<PitchResponse> searchPitches(String keyword, String city, String district, 
                                              String type, BigDecimal minPrice, BigDecimal maxPrice) {
        Pitch.PitchType pitchType = null;
        if (type != null && !type.isEmpty()) {
            try {
                pitchType = Pitch.PitchType.valueOf(type);
            } catch (IllegalArgumentException e) {
                // Invalid type, ignore
            }
        }
        
        return pitchRepository.searchPitches(keyword, city, district, pitchType, minPrice, maxPrice)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách thành phố có sân
     */
    public List<String> getCities() {
        return pitchRepository.findDistinctCities();
    }
    
    /**
     * Lấy danh sách quận theo thành phố
     */
    public List<String> getDistrictsByCity(String city) {
        return pitchRepository.findDistrictsByCity(city);
    }
    
    /**
     * Lấy khoảng giá
     */
    public Map<String, BigDecimal> getPriceRange() {
        Map<String, BigDecimal> range = new HashMap<>();
        BigDecimal minPrice = pitchRepository.findMinPrice();
        BigDecimal maxPrice = pitchRepository.findMaxPrice();
        range.put("minPrice", minPrice != null ? minPrice : BigDecimal.ZERO);
        range.put("maxPrice", maxPrice != null ? maxPrice : BigDecimal.valueOf(1000000));
        return range;
    }
    
    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    private PitchResponse convertToResponse(Pitch pitch) {
        PitchResponse response = new PitchResponse();
        response.setId(pitch.getId());
        response.setName(pitch.getName());
        response.setDescription(pitch.getDescription());
        response.setAddress(pitch.getAddress());
        response.setCity(pitch.getCity());
        response.setDistrict(pitch.getDistrict());
        response.setType(pitch.getType().name());
        response.setPricePerHour(pitch.getPricePerHour());
        response.setImages(pitch.getImages());
        response.setOpenTime(pitch.getOpenTime());
        response.setCloseTime(pitch.getCloseTime());
        response.setOwnerId(pitch.getOwner().getId());
        response.setOwnerName(pitch.getOwner().getFullName());
        response.setIsActive(pitch.getIsActive());
        response.setIsApproved(pitch.getIsApproved());
        response.setCreatedAt(pitch.getCreatedAt());
        return response;
    }
}
