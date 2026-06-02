package com.dung.smartpitchbooking.service;

import com.dung.smartpitchbooking.dto.FootballNewsItem;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class NewsService {

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");

    private final HttpClient httpClient = HttpClient.newBuilder().build();

    private final Map<String, List<String>> leagueKeywords = new HashMap<>();

    public NewsService() {
        leagueKeywords.put("all", List.of());
        leagueKeywords.put("premier_league", List.of("ngoại hạng anh", "premier league", "epl", "manchester", "arsenal", "chelsea", "liverpool", "tottenham"));
        leagueKeywords.put("champions_league", List.of("champions league", "c1", "uefa champions league"));
        leagueKeywords.put("la_liga", List.of("la liga", "laliga", "real madrid", "barcelona", "atletico"));
        leagueKeywords.put("serie_a", List.of("serie a", "juventus", "inter", "ac milan", "napoli", "roma"));
        leagueKeywords.put("bundesliga", List.of("bundesliga", "bayern", "dortmund", "leverkusen"));
        leagueKeywords.put("ligue_1", List.of("ligue 1", "psg", "paris saint-germain", "marseille", "lyon"));
        leagueKeywords.put("v_league", List.of("v-league", "v league", "đội tuyển việt nam", "u23 việt nam", "hà nội fc", "hoàng anh gia lai", "công an hà nội", "thép xanh nam định"));
    }

    private final List<RssSource> sources = List.of(
            new RssSource("VnExpress - Thể thao", "https://vnexpress.net/rss/the-thao.rss"),
            new RssSource("Tuổi Trẻ - Thể thao", "https://tuoitre.vn/rss/the-thao.rss"),
            new RssSource("Dân Trí - Bóng đá", "https://dantri.com.vn/the-thao/bong-da.rss")
    );

    public List<FootballNewsItem> getFootballNews(String league) {
        List<FootballNewsItem> aggregated = new ArrayList<>();

        for (RssSource source : sources) {
            try {
                aggregated.addAll(fetchFromSource(source));
            } catch (Exception ignored) {
                // Skip failed source and continue.
            }
        }

        if (aggregated.isEmpty()) {
            return List.of(
                    FootballNewsItem.builder()
                            .title("Không thể tải tin bóng đá từ nguồn bên ngoài")
                            .summary("Vui lòng kiểm tra kết nối mạng và thử lại sau.")
                            .source("Hệ thống")
                            .link("#")
                            .publishedAt(Instant.now().toString())
                            .build()
            );
        }

        aggregated.sort(Comparator.comparing(this::toInstantSafe).reversed());

        String normalizedLeague = normalizeLeague(league);
        if ("all".equals(normalizedLeague)) {
            return aggregated.stream().limit(30).toList();
        }

        List<String> keywords = leagueKeywords.getOrDefault(normalizedLeague, List.of());
        return aggregated.stream()
                .filter(item -> matchesLeague(item, keywords))
                .limit(30)
                .toList();
    }

    private String normalizeLeague(String league) {
        if (league == null || league.isBlank()) {
            return "all";
        }
        String normalized = league.trim().toLowerCase(Locale.ROOT);
        return leagueKeywords.containsKey(normalized) ? normalized : "all";
    }

    private boolean matchesLeague(FootballNewsItem item, List<String> keywords) {
        if (keywords.isEmpty()) {
            return true;
        }

        String haystack = ((item.getTitle() == null ? "" : item.getTitle()) + " " +
                (item.getSummary() == null ? "" : item.getSummary())).toLowerCase(Locale.ROOT);

        for (String keyword : keywords) {
            if (haystack.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    private List<FootballNewsItem> fetchFromSource(RssSource source) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(source.url()))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            return List.of();
        }

        Document document = parseXml(response.body());
        NodeList itemNodes = document.getElementsByTagName("item");
        List<FootballNewsItem> items = new ArrayList<>();

        for (int i = 0; i < itemNodes.getLength(); i++) {
            Node itemNode = itemNodes.item(i);
            if (itemNode.getNodeType() != Node.ELEMENT_NODE) {
                continue;
            }

            Element item = (Element) itemNode;
            String title = getTagText(item, "title");
            String link = getTagText(item, "link");
            String pubDate = getTagText(item, "pubDate");
            String description = sanitizeDescription(getTagText(item, "description"));
            String imageUrl = extractImageUrl(item);

            if (title == null || title.isBlank() || link == null || link.isBlank()) {
                continue;
            }

            items.add(FootballNewsItem.builder()
                    .title(title.trim())
                    .link(link.trim())
                    .summary(description)
                    .source(source.name())
                    .publishedAt(normalizeDate(pubDate))
                    .imageUrl(imageUrl)
                    .build());
        }

        return items;
    }

    private Document parseXml(String xmlContent) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        factory.setXIncludeAware(false);
        factory.setExpandEntityReferences(false);

        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(new InputSource(new StringReader(xmlContent)));
    }

    private String getTagText(Element parent, String tagName) {
        NodeList nodes = parent.getElementsByTagName(tagName);
        if (nodes.getLength() == 0) {
            return null;
        }
        return nodes.item(0).getTextContent();
    }

    private String extractImageUrl(Element item) {
        NodeList mediaContent = item.getElementsByTagName("media:content");
        if (mediaContent.getLength() > 0 && mediaContent.item(0) instanceof Element element) {
            String url = element.getAttribute("url");
            if (url != null && !url.isBlank()) {
                return url;
            }
        }

        NodeList enclosures = item.getElementsByTagName("enclosure");
        if (enclosures.getLength() > 0 && enclosures.item(0) instanceof Element element) {
            String url = element.getAttribute("url");
            if (url != null && !url.isBlank()) {
                return url;
            }
        }

        return null;
    }

    private String sanitizeDescription(String description) {
        if (description == null) {
            return "";
        }
        String noHtml = HTML_TAG_PATTERN.matcher(description).replaceAll("");
        String compact = noHtml.replace("\n", " ").replace("\r", " ").replaceAll("\\s+", " ").trim();
        if (compact.length() <= 220) {
            return compact;
        }
        return compact.substring(0, 220) + "...";
    }

    private String normalizeDate(String rawDate) {
        if (rawDate == null || rawDate.isBlank()) {
            return Instant.now().toString();
        }

        try {
            return ZonedDateTime.parse(rawDate, DateTimeFormatter.RFC_1123_DATE_TIME).toInstant().toString();
        } catch (DateTimeParseException ignored) {
        }

        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE, d MMM yyyy HH:mm:ss Z", Locale.ENGLISH);
            return ZonedDateTime.parse(rawDate, formatter).toInstant().toString();
        } catch (DateTimeParseException ignored) {
        }

        return Instant.now().toString();
    }

    private Instant toInstantSafe(FootballNewsItem item) {
        try {
            return Instant.parse(item.getPublishedAt());
        } catch (Exception ignored) {
            return Instant.EPOCH;
        }
    }

    private record RssSource(String name, String url) {
    }
}
