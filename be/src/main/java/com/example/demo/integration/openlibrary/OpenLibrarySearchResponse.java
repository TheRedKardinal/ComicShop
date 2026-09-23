package com.example.demo.integration.openlibrary;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Risposta di /search.json. Con lang=it ogni opera porta in editions.docs
 * l'edizione che meglio corrisponde alla lingua: da li' si prendono titolo e
 * copertina italiani, perche' quelli dell'opera sono spesso in lingua originale
 * (es. "ダンダダン 1" invece di "Dandadan 1").
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenLibrarySearchResponse {

    private List<Doc> docs;

    public List<Doc> getDocs() {
        return docs;
    }

    public void setDocs(List<Doc> docs) {
        this.docs = docs;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Doc {

        private String key;
        private String title;

        @JsonProperty("author_name")
        private List<String> authorNames;

        @JsonProperty("cover_i")
        private Long coverId;

        private Editions editions;

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

        public List<String> getAuthorNames() {
            return authorNames;
        }

        public void setAuthorNames(List<String> authorNames) {
            this.authorNames = authorNames;
        }

        public Long getCoverId() {
            return coverId;
        }

        public void setCoverId(Long coverId) {
            this.coverId = coverId;
        }

        public Editions getEditions() {
            return editions;
        }

        public void setEditions(Editions editions) {
            this.editions = editions;
        }

        /** Prima edizione restituita (quella nella lingua richiesta, se esiste). */
        public Edition bestEdition() {
            if (editions == null || editions.getDocs() == null || editions.getDocs().isEmpty()) {
                return null;
            }
            return editions.getDocs().get(0);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Editions {

        private List<Edition> docs;

        public List<Edition> getDocs() {
            return docs;
        }

        public void setDocs(List<Edition> docs) {
            this.docs = docs;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Edition {

        private String title;

        @JsonProperty("cover_i")
        private Long coverId;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public Long getCoverId() {
            return coverId;
        }

        public void setCoverId(Long coverId) {
            this.coverId = coverId;
        }
    }
}
