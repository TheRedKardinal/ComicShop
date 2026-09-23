package com.example.demo.integration.openlibrary;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "app.open-library")
public class OpenLibraryProperties {

    private String baseUrl;
    private String userAgent;
    private List<String> subjects = List.of();
    private Map<String, String> publisherSubjects = new LinkedHashMap<>();
    private int limit;
    private int pages;
    private int maxItems;

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

    public List<String> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<String> subjects) {
        this.subjects = subjects;
    }

    public Map<String, String> getPublisherSubjects() {
        return publisherSubjects;
    }

    public void setPublisherSubjects(Map<String, String> publisherSubjects) {
        this.publisherSubjects = publisherSubjects;
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

    public int getMaxItems() {
        return maxItems;
    }

    public void setMaxItems(int maxItems) {
        this.maxItems = maxItems;
    }
}
