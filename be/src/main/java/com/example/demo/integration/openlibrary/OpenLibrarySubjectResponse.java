package com.example.demo.integration.openlibrary;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenLibrarySubjectResponse {

    @JsonProperty("work_count")
    private int workCount;

    private List<Work> works;

    public int getWorkCount() {
        return workCount;
    }

    public void setWorkCount(int workCount) {
        this.workCount = workCount;
    }

    public List<Work> getWorks() {
        return works;
    }

    public void setWorks(List<Work> works) {
        this.works = works;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Work {

        private String key;
        private String title;
        private List<Author> authors;

        @JsonProperty("cover_id")
        private Long coverId;

        @JsonProperty("first_publish_year")
        private Integer firstPublishYear;

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public List<Author> getAuthors() {
            return authors;
        }

        public void setAuthors(List<Author> authors) {
            this.authors = authors;
        }

        public Long getCoverId() {
            return coverId;
        }

        public void setCoverId(Long coverId) {
            this.coverId = coverId;
        }

        public Integer getFirstPublishYear() {
            return firstPublishYear;
        }

        public void setFirstPublishYear(Integer firstPublishYear) {
            this.firstPublishYear = firstPublishYear;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Author {

        private String name;
        private String key;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }
    }
}
