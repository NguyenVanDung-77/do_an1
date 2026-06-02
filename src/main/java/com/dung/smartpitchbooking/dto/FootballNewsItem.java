package com.dung.smartpitchbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FootballNewsItem {
    private String title;
    private String link;
    private String summary;
    private String source;
    private String publishedAt;
    private String imageUrl;
}
