package com.dung.smartpitchbooking.service;

import com.dung.smartpitchbooking.dto.UserResponse;
import com.dung.smartpitchbooking.entity.User;
import com.dung.smartpitchbooking.repository.BookingRepository;
import com.dung.smartpitchbooking.repository.PitchRepository;
import com.dung.smartpitchbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PitchRepository pitchRepository;
    
    /**
     * Lấy danh sách tất cả users (trừ ADMIN)
     */
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != User.Role.ADMIN) // Không hiển thị admin
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách users theo role
     */
    public List<UserResponse> getUsersByRole(User.Role role) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == role)
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy chi tiết một user
     */
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return toUserResponse(user);
    }
    
    /**
     * Khóa/Mở khóa tài khoản user
     */
    @Transactional
    public UserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        // Không cho phép khóa admin
        if (user.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Không thể khóa tài khoản Admin");
        }
        
        user.setIsActive(!user.getIsActive());
        User savedUser = userRepository.save(user);
        
        return toUserResponse(savedUser);
    }
    
    /**
     * Thay đổi role của user (USER <-> OWNER)
     */
    @Transactional
    public UserResponse changeUserRole(Long userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        // Không cho phép thay đổi role của admin
        if (user.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Không thể thay đổi role của Admin");
        }
        
        try {
            User.Role role = User.Role.valueOf(newRole.toUpperCase());
            // Chỉ cho phép đổi thành USER hoặc OWNER
            if (role == User.Role.ADMIN) {
                throw new RuntimeException("Không thể cấp quyền Admin");
            }
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Role không hợp lệ: " + newRole);
        }
        
        User savedUser = userRepository.save(user);
        return toUserResponse(savedUser);
    }
    
    /**
     * Xóa user (soft delete - chỉ khóa tài khoản)
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        if (user.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Không thể xóa tài khoản Admin");
        }
        
        // Soft delete: chỉ khóa tài khoản
        user.setIsActive(false);
        userRepository.save(user);
    }
    
    private UserResponse toUserResponse(User user) {
        UserResponse response = UserResponse.fromEntity(user);
        
        // Đếm số booking của user
        int totalBookings = bookingRepository.findByUserOrderByBookingDateDescCreatedAtDesc(user).size();
        response.setTotalBookings(totalBookings);
        
        // Nếu là OWNER, đếm số sân
        if (user.getRole() == User.Role.OWNER) {
            int totalPitches = pitchRepository.findByOwner(user).size();
            response.setTotalPitches(totalPitches);
        }
        
        return response;
    }
}
