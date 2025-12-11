package com.dung.smartpitchbooking.config;

import com.dung.smartpitchbooking.entity.Pitch;
import com.dung.smartpitchbooking.entity.User;
import com.dung.smartpitchbooking.repository.PitchRepository;
import com.dung.smartpitchbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PitchRepository pitchRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Tạo admin nếu chưa có
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@smartpitch.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Admin Hệ Thống");
            admin.setPhoneNumber("0999999999");
            admin.setRole(User.Role.ADMIN);
            admin.setIsActive(true);
            userRepository.save(admin);
            System.out.println("✅ Admin account created - username: admin, password: admin123");
        }
        
        // Tạo chủ sân mẫu
        if (!userRepository.existsByUsername("owner1")) {
            User owner = new User();
            owner.setUsername("owner1");
            owner.setEmail("owner1@gmail.com");
            owner.setPassword(passwordEncoder.encode("123456"));
            owner.setFullName("Nguyễn Văn A");
            owner.setPhoneNumber("0123456789");
            owner.setRole(User.Role.OWNER);
            owner.setIsActive(true);
            User savedOwner = userRepository.save(owner);
            System.out.println("✅ Owner account created - username: owner1, password: 123456");
            
            // Tạo sân mẫu cho owner
            Pitch pitch1 = new Pitch();
            pitch1.setName("Sân Bóng Thảo Điền");
            pitch1.setDescription("Sân bóng đá cỏ nhân tạo cao cấp, có mái che, phòng thay đồ hiện đại");
            pitch1.setAddress("123 Đường Xuân Thủy");
            pitch1.setCity("Hồ Chí Minh");
            pitch1.setDistrict("Quận 2");
            pitch1.setType(Pitch.PitchType.PITCH_5);
            pitch1.setPricePerHour(new BigDecimal("250000"));
            pitch1.setImages("https://picsum.photos/800/600?random=1");
            pitch1.setOpenTime("06:00");
            pitch1.setCloseTime("22:00");
            pitch1.setOwner(savedOwner);
            pitch1.setIsActive(true);
            pitch1.setIsApproved(true);
            pitchRepository.save(pitch1);
            
            Pitch pitch2 = new Pitch();
            pitch2.setName("Sân Bóng Phú Nhuận");
            pitch2.setDescription("Sân bóng 7 người tiêu chuẩn, ánh sáng tốt, bãi đỗ xe rộng rãi");
            pitch2.setAddress("456 Đường Phan Đăng Lưu");
            pitch2.setCity("Hồ Chí Minh");
            pitch2.setDistrict("Phú Nhuận");
            pitch2.setType(Pitch.PitchType.PITCH_7);
            pitch2.setPricePerHour(new BigDecimal("350000"));
            pitch2.setImages("https://picsum.photos/800/600?random=2");
            pitch2.setOpenTime("06:00");
            pitch2.setCloseTime("23:00");
            pitch2.setOwner(savedOwner);
            pitch2.setIsActive(true);
            pitch2.setIsApproved(true);
            pitchRepository.save(pitch2);
            
            Pitch pitch3 = new Pitch();
            pitch3.setName("Sân Bóng Tân Bình");
            pitch3.setDescription("Sân bóng 5 người, giá rẻ, phù hợp sinh viên và công nhân viên");
            pitch3.setAddress("789 Cộng Hòa");
            pitch3.setCity("Hồ Chí Minh");
            pitch3.setDistrict("Tân Bình");
            pitch3.setType(Pitch.PitchType.PITCH_5);
            pitch3.setPricePerHour(new BigDecimal("180000"));
            pitch3.setImages("https://picsum.photos/800/600?random=3");
            pitch3.setOpenTime("05:30");
            pitch3.setCloseTime("22:30");
            pitch3.setOwner(savedOwner);
            pitch3.setIsActive(true);
            pitch3.setIsApproved(true);
            pitchRepository.save(pitch3);
            
            Pitch pitch4 = new Pitch();
            pitch4.setName("Sân Bóng Bình Thạnh");
            pitch4.setDescription("Sân bóng 11 người full size, cỏ nhân tạo cao cấp nhập khẩu");
            pitch4.setAddress("234 Điện Biên Phủ");
            pitch4.setCity("Hồ Chí Minh");
            pitch4.setDistrict("Bình Thạnh");
            pitch4.setType(Pitch.PitchType.PITCH_11);
            pitch4.setPricePerHour(new BigDecimal("800000"));
            pitch4.setImages("https://picsum.photos/800/600?random=4");
            pitch4.setOpenTime("06:00");
            pitch4.setCloseTime("22:00");
            pitch4.setOwner(savedOwner);
            pitch4.setIsActive(true);
            pitch4.setIsApproved(true);
            pitchRepository.save(pitch4);
            
            Pitch pitch5 = new Pitch();
            pitch5.setName("Sân Bóng Gò Vấp");
            pitch5.setDescription("Sân bóng 7 người có mái che, căng tin bán nước giải khát");
            pitch5.setAddress("567 Quang Trung");
            pitch5.setCity("Hồ Chí Minh");
            pitch5.setDistrict("Gò Vấp");
            pitch5.setType(Pitch.PitchType.PITCH_7);
            pitch5.setPricePerHour(new BigDecimal("280000"));
            pitch5.setImages("https://picsum.photos/800/600?random=5");
            pitch5.setOpenTime("06:00");
            pitch5.setCloseTime("23:00");
            pitch5.setOwner(savedOwner);
            pitch5.setIsActive(true);
            pitch5.setIsApproved(true);
            pitchRepository.save(pitch5);
            
            Pitch pitch6 = new Pitch();
            pitch6.setName("Sân Bóng Thủ Đức");
            pitch6.setDescription("Sân bóng 5 người hiện đại, gần khu công nghệ cao");
            pitch6.setAddress("890 Võ Văn Ngân");
            pitch6.setCity("Hồ Chí Minh");
            pitch6.setDistrict("Thủ Đức");
            pitch6.setType(Pitch.PitchType.PITCH_5);
            pitch6.setPricePerHour(new BigDecimal("220000"));
            pitch6.setImages("https://picsum.photos/800/600?random=6");
            pitch6.setOpenTime("06:00");
            pitch6.setCloseTime("22:00");
            pitch6.setOwner(savedOwner);
            pitch6.setIsActive(true);
            pitch6.setIsApproved(true);
            pitchRepository.save(pitch6);
            
            System.out.println("✅ 6 sample pitches created");
        }
        
        // Tạo user thường
        if (!userRepository.existsByUsername("user1")) {
            User user = new User();
            user.setUsername("user1");
            user.setEmail("user1@gmail.com");
            user.setPassword(passwordEncoder.encode("123456"));
            user.setFullName("Trần Văn B");
            user.setPhoneNumber("0987654321");
            user.setRole(User.Role.USER);
            user.setIsActive(true);
            userRepository.save(user);
            System.out.println("✅ User account created - username: user1, password: 123456");
        }
        
        System.out.println("\n🎉 Database initialized successfully!");
        System.out.println("📝 Test accounts:");
        System.out.println("   - Admin: admin / admin123");
        System.out.println("   - Owner: owner1 / 123456");
        System.out.println("   - User: user1 / 123456");
    }
}
