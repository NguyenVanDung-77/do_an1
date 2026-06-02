package com.dung.smartpitchbooking.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatMessageResponse {
    private Long id;
    private Long bookingId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String content;
    private Boolean isMine;
    private LocalDateTime createdAt;
}
