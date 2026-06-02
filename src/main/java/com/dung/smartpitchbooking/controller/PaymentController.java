package com.dung.smartpitchbooking.controller;

import com.dung.smartpitchbooking.dto.PaymentCreateResponse;
import com.dung.smartpitchbooking.dto.PaymentStatusResponse;
import com.dung.smartpitchbooking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/vietqr/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentCreateResponse> createVietQrPayment(@RequestParam Long bookingId) {
        return ResponseEntity.ok(paymentService.createVietQrPayment(bookingId));
    }

    @PutMapping("/booking/{bookingId}/request-confirmation")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentStatusResponse> requestPaymentConfirmation(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.requestPaymentConfirmation(bookingId));
    }

    @PutMapping("/booking/{bookingId}/confirm")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentStatusResponse> confirmPayment(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.confirmPayment(bookingId));
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatusByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId));
    }

    @GetMapping("/vietqr/health")
    public ResponseEntity<Map<String, String>> vietQrHealth() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "VietQR payment endpoints are ready");
        return ResponseEntity.ok(response);
    }
}
