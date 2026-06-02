package com.dung.smartpitchbooking.repository;

import com.dung.smartpitchbooking.entity.Booking;
import com.dung.smartpitchbooking.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByBookingOrderByCreatedAtAsc(Booking booking);

    Optional<ChatMessage> findTopByBookingOrderByCreatedAtDesc(Booking booking);
}
