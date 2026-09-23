package com.example.demo.integration.openlibrary;

import com.example.demo.model.ComicCategory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "app.open-library")
public class OpenLibraryProperties {

    private String baseUrl;
    private String userAgent;
    private String language;
    private Map<String, ComicCategory> subjects = new LinkedHashMap<>();
    private List<Publisher> publishers = new ArrayList<>();
    private int limit;
    private int pages;
    private int perPublisher;
    private int maxItems;

    /** Categoria associata a un'etichetta di editore; ALTRO se l'editore non e' configurato. */
    public ComicCategory categoryOf(String publisherLabel) {
        return publishers.stream()
                .filter(p -> p.getLabel().equals(publisherLabel))
                .map(Publisher::getCategory)
                .findFirst()
                .orElse(ComicCategory.ALTRO);
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Map<String, ComicCategory> getSubjects() {
        return subjects;
    }

    public void setSubjects(Map<String, ComicCategory> subjects) {
        this.subjects = subjects;
    }

    public List<Publisher> getPublishers() {
        return publishers;
    }

    public void setPublishers(List<Publisher> publishers) {
        this.publishers = publishers;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public int getPages() {
        return pages;
    }

    public void setPages(int pages) {
        this.pages = pages;
    }

    public int getPerPublisher() {
        return perPublisher;
    }

    public void setPerPublisher(int perPublisher) {
        this.perPublisher = perPublisher;
    }

    public int getMaxItems() {
        return maxItems;
    }

    public void setMaxItems(int maxItems) {
        this.maxItems = maxItems;
    }

    public static class Publisher {

        /** Nome mostrato sull'etichetta del fumetto. */
        private String label;
        /** Testo cercato nel campo publisher di Open Library. */
        private String query;
        private ComicCategory category;

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public String getQuery() {
            return query;
        }

        public void setQuery(String query) {
            this.query = query;
        }

        public ComicCategory getCategory() {
            return category;
        }

        public void setCategory(ComicCategory category) {
            this.category = category;
        }
    }
}
