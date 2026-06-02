package com.dung.smartpitchbooking.controller;

import com.dung.smartpitchbooking.dto.FootballNewsItem;
import com.dung.smartpitchbooking.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping("/football")
    public ResponseEntity<List<FootballNewsItem>> getFootballNews(
            @RequestParam(required = false, defaultValue = "all") String league) {
        return ResponseEntity.ok(newsService.getFootballNews(league));
    }
}
