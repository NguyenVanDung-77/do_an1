package com.dung.smartpitchbooking.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentStatusResponse {
    private Long bookingId;
    private String provider;
    private String paymentStatus;
    private BigDecimal amount;
    private String txnRef;
    private String vnpTransactionNo;
    private String bankCode;
    private String failureReason;
    private LocalDateTime paidAt;
}
