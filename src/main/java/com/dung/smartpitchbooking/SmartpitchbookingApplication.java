package com.dung.smartpitchbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartpitchbookingApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartpitchbookingApplication.class, args);
	}

}
