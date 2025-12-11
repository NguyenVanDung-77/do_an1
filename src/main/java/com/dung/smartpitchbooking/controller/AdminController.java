package com.dung.smartpitchbooking.controller;

import com.dung.smartpitchbooking.dto.UserResponse;
import com.dung.smartpitchbooking.entity.User;
import com.dung.smartpitchbooking.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {
    
    private final AdminService adminService;
    
    /**
     * Lấy danh sách tất cả users (trừ ADMIN)
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    /**
     * Lấy danh sách users theo role
     * GET /api/admin/users/role/{role}
     */
    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable String role) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            List<UserResponse> users = adminService.getUsersByRole(userRole);
            return ResponseEntity.ok(users);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Lấy chi tiết một user
     * GET /api/admin/users/{userId}
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        UserResponse user = adminService.getUserById(userId);
        return ResponseEntity.ok(user);
    }
    
    /**
     * Khóa/Mở khóa tài khoản user
     * PUT /api/admin/users/{userId}/toggle-status
     */
    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable Long userId) {
        UserResponse user = adminService.toggleUserStatus(userId);
        return ResponseEntity.ok(user);
    }
    
    /**
     * Thay đổi role của user
     * PUT /api/admin/users/{userId}/change-role
     */
    @PutMapping("/users/{userId}/change-role")
    public ResponseEntity<UserResponse> changeUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        
        String newRole = request.get("role");
        if (newRole == null || newRole.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        UserResponse user = adminService.changeUserRole(userId, newRole);
        return ResponseEntity.ok(user);
    }
    
    /**
     * Xóa user (soft delete)
     * DELETE /api/admin/users/{userId}
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("message", "Đã khóa tài khoản người dùng"));
    }
}
