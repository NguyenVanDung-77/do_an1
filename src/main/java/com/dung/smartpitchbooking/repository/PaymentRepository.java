package com.dung.smartpitchbooking.repository;

import com.dung.smartpitchbooking.entity.Booking;
import com.dung.smartpitchbooking.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBooking(Booking booking);

    Optional<Payment> findByTxnRef(String txnRef);
}
