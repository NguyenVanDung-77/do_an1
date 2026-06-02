package com.dung.smartpitchbooking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentCreateResponse {
    private Long bookingId;
    private String provider;
    private String paymentStatus;
    private String paymentUrl;
    private String txnRef;
    private String bankBin;
    private String accountNo;
    private String accountName;
    private String transferContent;
}
