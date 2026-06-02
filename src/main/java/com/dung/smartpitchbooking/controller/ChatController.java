package com.dung.smartpitchbooking.controller;

import com.dung.smartpitchbooking.dto.ChatConversationResponse;
import com.dung.smartpitchbooking.dto.ChatMessageRequest;
import com.dung.smartpitchbooking.dto.ChatMessageResponse;
import com.dung.smartpitchbooking.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChatConversationResponse>> getMyConversations() {
        return ResponseEntity.ok(chatService.getMyConversations());
    }

    @GetMapping("/booking/{bookingId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChatMessageResponse>> getMessagesByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(chatService.getMessagesByBooking(bookingId));
    }

    @PostMapping("/booking/{bookingId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable Long bookingId,
            @Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(bookingId, request));
    }
}
