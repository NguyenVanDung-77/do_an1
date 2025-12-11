package com.dung.smartpitchbooking.service;

import com.dung.smartpitchbooking.entity.Booking;
import com.dung.smartpitchbooking.entity.Booking.BookingStatus;
import com.dung.smartpitchbooking.entity.Pitch;
import com.dung.smartpitchbooking.entity.User;
import com.dung.smartpitchbooking.repository.BookingRepository;
import com.dung.smartpitchbooking.repository.PitchRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    
    private final BookingRepository bookingRepository;
    private final PitchRepository pitchRepository;
    
    /**
     * Chuyển tiếng Việt có dấu thành không dấu
     */
    private String removeVietnameseDiacritics(String str) {
        if (str == null) return "";
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String result = pattern.matcher(normalized).replaceAll("");
        // Xử lý đ -> d
        result = result.replace("đ", "d").replace("Đ", "D");
        return result;
    }
    
    /**
     * Xuất báo cáo Excel cho Owner
     */
    public byte[] exportOwnerReportExcel(User owner) throws Exception {
        List<Pitch> pitches = pitchRepository.findByOwner(owner);
        List<Booking> allBookings = bookingRepository.findByPitchOwner(owner);
        
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // === SHEET 1: Tong quan ===
            Sheet overviewSheet = workbook.createSheet("Tong quan");
            createOverviewSheet(workbook, overviewSheet, pitches, allBookings);
            
            // === SHEET 2: Chi tiet booking ===
            Sheet bookingSheet = workbook.createSheet("Chi tiet booking");
            createBookingDetailSheet(workbook, bookingSheet, allBookings);
            
            // === SHEET 3: Thong ke theo san ===
            Sheet pitchSheet = workbook.createSheet("Thong ke theo san");
            createPitchStatsSheet(workbook, pitchSheet, pitches, allBookings);
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
    
    private void createOverviewSheet(Workbook workbook, Sheet sheet, List<Pitch> pitches, List<Booking> bookings) {
        // Style cho header
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        // Style cho số tiền
        CellStyle moneyStyle = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        moneyStyle.setDataFormat(format.getFormat("#,##0"));
        
        int rowNum = 0;
        
        // Tiêu đề
        Row titleRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(removeVietnameseDiacritics("BAO CAO THONG KE DOANH THU"));
        titleCell.setCellStyle(headerStyle);
        
        Row dateRow = sheet.createRow(rowNum++);
        dateRow.createCell(0).setCellValue(removeVietnameseDiacritics("Ngay xuat: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));
        
        rowNum++; // Dòng trống
        
        // Thống kê tổng quan
        List<Booking> confirmedBookings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.toList());
        
        BigDecimal totalRevenue = confirmedBookings.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        createStatRow(sheet, rowNum++, removeVietnameseDiacritics("Tong so san"), String.valueOf(pitches.size()));
        createStatRow(sheet, rowNum++, removeVietnameseDiacritics("Tong so booking"), String.valueOf(bookings.size()));
        createStatRow(sheet, rowNum++, removeVietnameseDiacritics("Booking thanh cong"), String.valueOf(confirmedBookings.size()));
        createStatRow(sheet, rowNum++, removeVietnameseDiacritics("Tong doanh thu (VND)"), String.format("%,.0f", totalRevenue));
        
        // Thống kê tháng này
        YearMonth currentMonth = YearMonth.now();
        List<Booking> thisMonthBookings = confirmedBookings.stream()
                .filter(b -> YearMonth.from(b.getBookingDate()).equals(currentMonth))
                .collect(Collectors.toList());
        BigDecimal thisMonthRevenue = thisMonthBookings.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        rowNum++;
        createStatRow(sheet, rowNum++, removeVietnameseDiacritics("Booking thang nay"), String.valueOf(thisMonthBookings.size()));
        createStatRow(sheet, rowNum++, removeVietnameseDiacritics("Doanh thu thang nay (VND)"), String.format("%,.0f", thisMonthRevenue));
        
        // Auto-size columns
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }
    
    private void createStatRow(Sheet sheet, int rowNum, String label, String value) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
    }
    
    private void createBookingDetailSheet(Workbook workbook, Sheet sheet, List<Booking> bookings) {
        // Style cho header
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        // Header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"STT", "Ten san", "Nguoi dat", "SDT", "Ngay", "Gio", "Gia (VND)", "Trang thai"};
        for (int i = 0; i < headers.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
            cell.setCellValue(removeVietnameseDiacritics(headers[i]));
            cell.setCellStyle(headerStyle);
        }
        
        // Data rows
        int rowNum = 1;
        for (Booking booking : bookings) {
            Row row = sheet.createRow(rowNum);
            row.createCell(0).setCellValue(rowNum);
            row.createCell(1).setCellValue(removeVietnameseDiacritics(booking.getPitch().getName()));
            row.createCell(2).setCellValue(removeVietnameseDiacritics(booking.getUser().getFullName()));
            row.createCell(3).setCellValue(booking.getPhoneNumber());
            row.createCell(4).setCellValue(booking.getBookingDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            row.createCell(5).setCellValue(booking.getStartTime() + "-" + booking.getEndTime());
            row.createCell(6).setCellValue(booking.getTotalPrice().doubleValue());
            row.createCell(7).setCellValue(removeVietnameseDiacritics(getStatusText(booking.getStatus())));
            rowNum++;
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    private void createPitchStatsSheet(Workbook workbook, Sheet sheet, List<Pitch> pitches, List<Booking> allBookings) {
        // Style cho header
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        // Group bookings by pitch
        Map<Long, List<Booking>> bookingsByPitch = allBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getPitch().getId()));
        
        // Header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"STT", "Ten san", "Loai san", "Gia/gio", "Tong booking", "Doanh thu (VND)"};
        for (int i = 0; i < headers.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
            cell.setCellValue(removeVietnameseDiacritics(headers[i]));
            cell.setCellStyle(headerStyle);
        }
        
        // Data rows
        int rowNum = 1;
        for (Pitch pitch : pitches) {
            List<Booking> pitchBookings = bookingsByPitch.getOrDefault(pitch.getId(), List.of());
            List<Booking> successBookings = pitchBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                    .collect(Collectors.toList());
            BigDecimal revenue = successBookings.stream()
                    .map(Booking::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Row row = sheet.createRow(rowNum);
            row.createCell(0).setCellValue(rowNum);
            row.createCell(1).setCellValue(removeVietnameseDiacritics(pitch.getName()));
            row.createCell(2).setCellValue(removeVietnameseDiacritics(getPitchTypeText(pitch.getType())));
            row.createCell(3).setCellValue(pitch.getPricePerHour().doubleValue());
            row.createCell(4).setCellValue(successBookings.size());
            row.createCell(5).setCellValue(revenue.doubleValue());
            rowNum++;
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    private String getStatusText(BookingStatus status) {
        return switch (status) {
            case PENDING -> "Cho xac nhan";
            case CONFIRMED -> "Da xac nhan";
            case COMPLETED -> "Hoan thanh";
            case CANCELLED -> "Da huy";
            case REJECTED -> "Tu choi";
        };
    }
    
    private String getPitchTypeText(Pitch.PitchType type) {
        return switch (type) {
            case PITCH_5 -> "San 5 nguoi";
            case PITCH_7 -> "San 7 nguoi";
            case PITCH_11 -> "San 11 nguoi";
        };
    }
    
    /**
     * Xuất báo cáo PDF cho Owner
     */
    public byte[] exportOwnerReportPdf(User owner) throws Exception {
        List<Pitch> pitches = pitchRepository.findByOwner(owner);
        List<Booking> allBookings = bookingRepository.findByPitchOwner(owner);
        
        List<Booking> confirmedBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.toList());
        
        BigDecimal totalRevenue = confirmedBookings.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            // Tiêu đề
            Paragraph title = new Paragraph(removeVietnameseDiacritics("BAO CAO THONG KE DOANH THU"))
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);
            
            Paragraph date = new Paragraph(removeVietnameseDiacritics("Ngay xuat: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))))
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(date);
            
            document.add(new Paragraph("\n"));
            
            // Thống kê tổng quan
            document.add(new Paragraph(removeVietnameseDiacritics("THONG KE TONG QUAN")).setBold().setFontSize(14));
            document.add(new Paragraph(removeVietnameseDiacritics("- Tong so san: " + pitches.size())));
            document.add(new Paragraph(removeVietnameseDiacritics("- Tong so booking: " + allBookings.size())));
            document.add(new Paragraph(removeVietnameseDiacritics("- Booking thanh cong: " + confirmedBookings.size())));
            document.add(new Paragraph(removeVietnameseDiacritics("- Tong doanh thu: " + String.format("%,.0f", totalRevenue) + " VND")));
            
            document.add(new Paragraph("\n"));
            
            // Bảng chi tiết booking
            document.add(new Paragraph(removeVietnameseDiacritics("CHI TIET BOOKING")).setBold().setFontSize(14));
            
            Table table = new Table(UnitValue.createPercentArray(new float[]{1, 3, 2, 2, 2, 2}));
            table.setWidth(UnitValue.createPercentValue(100));
            
            // Header
            String[] headers = {"STT", "Ten san", "Nguoi dat", "Ngay", "Gio", "Gia"};
            for (String header : headers) {
                table.addHeaderCell(new Cell().add(new Paragraph(removeVietnameseDiacritics(header)).setBold()));
            }
            
            // Data (chỉ lấy 20 booking gần nhất)
            List<Booking> recentBookings = allBookings.stream().limit(20).collect(Collectors.toList());
            int stt = 1;
            for (Booking booking : recentBookings) {
                table.addCell(new Cell().add(new Paragraph(String.valueOf(stt++))));
                table.addCell(new Cell().add(new Paragraph(removeVietnameseDiacritics(booking.getPitch().getName()))));
                table.addCell(new Cell().add(new Paragraph(removeVietnameseDiacritics(booking.getUser().getFullName()))));
                table.addCell(new Cell().add(new Paragraph(booking.getBookingDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))));
                table.addCell(new Cell().add(new Paragraph(booking.getStartTime() + "-" + booking.getEndTime())));
                table.addCell(new Cell().add(new Paragraph(String.format("%,.0f", booking.getTotalPrice()))));
            }
            
            document.add(table);
            
            if (allBookings.size() > 20) {
                document.add(new Paragraph(removeVietnameseDiacritics("... va " + (allBookings.size() - 20) + " booking khac")).setItalic());
            }
            
            document.close();
            return out.toByteArray();
        }
    }
}
