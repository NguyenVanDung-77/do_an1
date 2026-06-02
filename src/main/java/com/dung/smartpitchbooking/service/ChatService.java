package com.dung.smartpitchbooking.service;

import com.dung.smartpitchbooking.dto.ChatConversationResponse;
import com.dung.smartpitchbooking.dto.ChatMessageRequest;
import com.dung.smartpitchbooking.dto.ChatMessageResponse;
import com.dung.smartpitchbooking.entity.Booking;
import com.dung.smartpitchbooking.entity.ChatMessage;
import com.dung.smartpitchbooking.entity.User;
import com.dung.smartpitchbooking.repository.BookingRepository;
import com.dung.smartpitchbooking.repository.ChatMessageRepository;
import com.dung.smartpitchbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public List<ChatConversationResponse> getMyConversations() {
        User currentUser = getCurrentUser();

        List<Booking> bookings;
        if (currentUser.getRole() == User.Role.USER) {
            bookings = bookingRepository.findByUserOrderByBookingDateDescCreatedAtDesc(currentUser);
        } else if (currentUser.getRole() == User.Role.OWNER) {
            bookings = bookingRepository.findByPitchOwner(currentUser);
        } else {
            bookings = bookingRepository.findAll();
        }

        List<ChatConversationResponse> conversations = new ArrayList<>();
        for (Booking booking : bookings) {
            User counterpart = resolveCounterpart(currentUser, booking);
            ChatMessage lastMessage = chatMessageRepository.findTopByBookingOrderByCreatedAtDesc(booking).orElse(null);

            conversations.add(ChatConversationResponse.builder()
                    .bookingId(booking.getId())
                    .pitchId(booking.getPitch().getId())
                    .pitchName(booking.getPitch().getName())
                    .bookingDate(booking.getBookingDate())
                    .bookingStatus(booking.getStatus().name())
                    .counterpartId(counterpart.getId())
                    .counterpartName(counterpart.getFullName())
                    .counterpartRole(counterpart.getRole().name())
                    .lastMessage(lastMessage != null ? lastMessage.getContent() : "Chưa có tin nhắn")
                    .lastMessageAt(lastMessage != null ? lastMessage.getCreatedAt() : booking.getCreatedAt())
                    .build());
        }

        conversations.sort(Comparator.comparing(ChatConversationResponse::getLastMessageAt,
                Comparator.nullsLast(Comparator.naturalOrder())).reversed());

        return conversations;
    }

    public List<ChatMessageResponse> getMessagesByBooking(Long bookingId) {
        User currentUser = getCurrentUser();
        Booking booking = getBookingAndValidateAccess(bookingId, currentUser);

        return chatMessageRepository.findByBookingOrderByCreatedAtAsc(booking)
                .stream()
                .map(message -> toMessageResponse(message, currentUser))
                .toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(Long bookingId, ChatMessageRequest request) {
        User currentUser = getCurrentUser();
        Booking booking = getBookingAndValidateAccess(bookingId, currentUser);

        String content = request.getContent().trim();
        if (content.isEmpty()) {
            throw new RuntimeException("Nội dung tin nhắn không được để trống");
        }

        ChatMessage message = new ChatMessage();
        message.setBooking(booking);
        message.setSender(currentUser);
        message.setContent(content);

        ChatMessage saved = chatMessageRepository.save(message);
        return toMessageResponse(saved, currentUser);
    }

    private Booking getBookingAndValidateAccess(Long bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân"));

        boolean isBookingUser = booking.getUser().getId().equals(currentUser.getId());
        boolean isPitchOwner = booking.getPitch().getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;

        if (!isBookingUser && !isPitchOwner && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền truy cập cuộc trò chuyện này");
        }

        return booking;
    }

    private User resolveCounterpart(User currentUser, Booking booking) {
        if (currentUser.getRole() == User.Role.USER) {
            return booking.getPitch().getOwner();
        }
        if (currentUser.getRole() == User.Role.OWNER) {
            return booking.getUser();
        }

        // Với admin, ưu tiên hiển thị người đặt để dễ theo dõi.
        return booking.getUser();
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message, User currentUser) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .bookingId(message.getBooking().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .senderRole(message.getSender().getRole().name())
                .content(message.getContent())
                .isMine(message.getSender().getId().equals(currentUser.getId()))
                .createdAt(message.getCreatedAt())
                .build();
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
