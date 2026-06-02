package com.dung.smartpitchbooking.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ChatConversationResponse {
    private Long bookingId;
    private Long pitchId;
    private String pitchName;
    private LocalDate bookingDate;
    private String bookingStatus;
    private Long counterpartId;
    private String counterpartName;
    private String counterpartRole;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
}
