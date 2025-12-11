package com.dung.smartpitchbooking.controller;

import com.dung.smartpitchbooking.entity.User;
import com.dung.smartpitchbooking.repository.UserRepository;
import com.dung.smartpitchbooking.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    
    private final ReportService reportService;
    private final UserRepository userRepository;
    
    /**
     * Xuất báo cáo Excel cho Owner
     * GET /api/reports/owner/excel
     */
    @GetMapping("/owner/excel")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<byte[]> exportOwnerExcel(
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {
        
        User owner = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        byte[] excelBytes = reportService.exportOwnerReportExcel(owner);
        
        String filename = "bao-cao-doanh-thu-" + LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")) + ".xlsx";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
    
    /**
     * Xuất báo cáo PDF cho Owner
     * GET /api/reports/owner/pdf
     */
    @GetMapping("/owner/pdf")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<byte[]> exportOwnerPdf(
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {
        
        User owner = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        byte[] pdfBytes = reportService.exportOwnerReportPdf(owner);
        
        String filename = "bao-cao-doanh-thu-" + LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")) + ".pdf";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
