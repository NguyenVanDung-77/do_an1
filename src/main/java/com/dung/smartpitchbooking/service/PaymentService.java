package com.dung.smartpitchbooking.service;

import com.dung.smartpitchbooking.dto.PaymentCreateResponse;
import com.dung.smartpitchbooking.dto.PaymentStatusResponse;
import com.dung.smartpitchbooking.entity.Booking;
import com.dung.smartpitchbooking.entity.Payment;
import com.dung.smartpitchbooking.entity.User;
import com.dung.smartpitchbooking.repository.BookingRepository;
import com.dung.smartpitchbooking.repository.PaymentRepository;
import com.dung.smartpitchbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final String VIETQR_PROVIDER = "VIETQR";
    private static final String VIETQR_BASE_URL = "https://img.vietqr.io/image/";

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Value("${vietqr.template:compact}")
    private String template;

    @Transactional
    public PaymentCreateResponse createVietQrPayment(Long bookingId) {
        User currentUser = getCurrentUser();
        Booking booking = getBookingForPayment(bookingId);

        boolean isOwner = booking.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền tạo thanh toán cho đơn này");
        }

        User pitchOwner = booking.getPitch().getOwner();
        validateOwnerBankInfo(pitchOwner);

        Payment payment = paymentRepository.findByBooking(booking).orElseGet(Payment::new);
        if (payment.getId() != null && payment.getStatus() == Payment.PaymentStatus.PAID) {
            throw new RuntimeException("Đơn này đã thanh toán");
        }

        String txnRef = payment.getTxnRef() != null ? payment.getTxnRef() : generateTxnRef(bookingId);
        String transferContent = buildTransferContent(bookingId, txnRef);
        String qrUrl = buildVietQrUrl(
            booking.getTotalPrice(),
            transferContent,
            pitchOwner.getBankBin(),
            pitchOwner.getBankAccountNo(),
            pitchOwner.getBankAccountName()
        );

        payment.setBooking(booking);
        payment.setAmount(booking.getTotalPrice());
        payment.setProvider(VIETQR_PROVIDER);
        payment.setTxnRef(txnRef);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setPaymentUrl(qrUrl);
        payment.setFailureReason(null);
        payment.setPaidAt(null);

        Payment saved;
        try {
            saved = paymentRepository.save(payment);
        } catch (DataIntegrityViolationException ex) {
            // React StrictMode có thể gọi API tạo QR hai lần trong môi trường dev.
            // Khi đó trả về bản ghi đã tồn tại thay vì báo lỗi trùng dữ liệu.
            Payment existing = paymentRepository.findByBooking(booking)
                    .orElseThrow(() -> new RuntimeException("Không thể tạo thanh toán, vui lòng thử lại"));

            String existingRef = existing.getTxnRef() != null ? existing.getTxnRef() : generateTxnRef(bookingId);
            if (existing.getTxnRef() == null) {
                existing.setTxnRef(existingRef);
                existing = paymentRepository.save(existing);
            }

            return buildCreateResponse(existing, pitchOwner);
        }

        return buildCreateResponse(saved, pitchOwner);
    }

    @Transactional
    public PaymentStatusResponse requestPaymentConfirmation(Long bookingId) {
        User currentUser = getCurrentUser();
        Booking booking = getBookingForPayment(bookingId);

        boolean isOwner = booking.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền gửi xác nhận thanh toán cho đơn này");
        }

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new RuntimeException("Bạn cần tạo mã VietQR trước khi gửi xác nhận"));

        if (payment.getStatus() == Payment.PaymentStatus.PAID) {
            return toStatusResponse(payment);
        }

        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setFailureReason("Người dùng đã gửi yêu cầu xác nhận chuyển khoản");
        paymentRepository.save(payment);

        return toStatusResponse(payment);
    }

    @Transactional
    public PaymentStatusResponse confirmPayment(Long bookingId) {
        User currentUser = getCurrentUser();
        Booking booking = getBookingForPayment(bookingId);

        boolean isPitchOwner = booking.getPitch().getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
        if (!isPitchOwner && !isAdmin) {
            throw new RuntimeException("Chỉ chủ sân hoặc admin mới có thể xác nhận thanh toán");
        }

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thanh toán"));

        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setFailureReason(null);

        paymentRepository.save(payment);
        return toStatusResponse(payment);
    }

    public PaymentStatusResponse getPaymentByBookingId(Long bookingId) {
        Booking booking = getBookingForPayment(bookingId);

        User currentUser = getCurrentUser();
        boolean isOwner = booking.getUser().getId().equals(currentUser.getId());
        boolean isPitchOwner = booking.getPitch().getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
        if (!isOwner && !isPitchOwner && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền xem thanh toán đơn này");
        }

        Payment payment = paymentRepository.findByBooking(booking).orElse(null);
        if (payment == null) {
            return PaymentStatusResponse.builder()
                    .bookingId(booking.getId())
                    .provider(VIETQR_PROVIDER)
                    .paymentStatus("UNPAID")
                    .amount(booking.getTotalPrice())
                    .build();
        }

        return toStatusResponse(payment);
    }

    private Booking getBookingForPayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân"));

        if (booking.getStatus() != Booking.BookingStatus.PENDING && booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("Chỉ có thể thanh toán đơn ở trạng thái chờ xác nhận hoặc đã xác nhận");
        }

        return booking;
    }

    private String buildTransferContent(Long bookingId, String txnRef) {
        String txnSuffix = txnRef.length() > 8 ? txnRef.substring(txnRef.length() - 8) : txnRef;
        return "BK" + bookingId + "-" + txnSuffix;
    }

    private String buildVietQrUrl(
            BigDecimal amount,
            String transferContent,
            String bankBin,
            String accountNo,
            String accountName) {
        long finalAmount = amount.longValue();
        return VIETQR_BASE_URL
                + bankBin + "-" + accountNo + "-" + template + ".png"
                + "?amount=" + finalAmount
                + "&addInfo=" + encode(transferContent)
                + "&accountName=" + encode(accountName);
    }

    private void validateOwnerBankInfo(User owner) {
        if (owner == null || owner.getRole() != User.Role.OWNER) {
            throw new RuntimeException("Không tìm thấy thông tin chủ sân để tạo VietQR");
        }

        if (isBlank(owner.getBankBin()) || isBlank(owner.getBankAccountNo()) || isBlank(owner.getBankAccountName())) {
            throw new RuntimeException("Chủ sân chưa cấu hình thông tin nhận tiền (BIN ngân hàng, số tài khoản, tên tài khoản)");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private String generateTxnRef(Long bookingId) {
        return "BK" + bookingId + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
    }

    private PaymentCreateResponse buildCreateResponse(Payment payment, User pitchOwner) {
        String txnRef = payment.getTxnRef() != null ? payment.getTxnRef() : generateTxnRef(payment.getBooking().getId());
        String transferContent = buildTransferContent(payment.getBooking().getId(), txnRef);

        return PaymentCreateResponse.builder()
                .bookingId(payment.getBooking().getId())
                .provider(payment.getProvider())
                .paymentStatus(payment.getStatus().name())
                .paymentUrl(payment.getPaymentUrl())
                .txnRef(txnRef)
                .bankBin(pitchOwner.getBankBin())
                .accountNo(pitchOwner.getBankAccountNo())
                .accountName(pitchOwner.getBankAccountName())
                .transferContent(transferContent)
                .build();
    }

    private PaymentStatusResponse toStatusResponse(Payment payment) {
        return PaymentStatusResponse.builder()
                .bookingId(payment.getBooking().getId())
                .provider(payment.getProvider())
                .paymentStatus(payment.getStatus().name())
                .amount(payment.getAmount())
                .txnRef(payment.getTxnRef())
                .vnpTransactionNo(payment.getVnpTransactionNo())
                .bankCode(payment.getBankCode())
                .failureReason(payment.getFailureReason())
                .paidAt(payment.getPaidAt())
                .build();
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
