package com.example.demo.integration.openlibrary;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class OpenLibraryClient {

    private static final Logger log = LoggerFactory.getLogger(OpenLibraryClient.class);

    private static final String SEARCH_FIELDS = "key,title,author_name,cover_i,editions,editions.title,editions.cover_i";

    private final RestClient restClient;

    public OpenLibraryClient(OpenLibraryProperties properties) {
        this.restClient = RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader(HttpHeaders.USER_AGENT, properties.getUserAgent())
                .build();
    }

    public List<OpenLibrarySubjectResponse.Work> fetchSubjectWorks(String subject, int limit, int offset) {
        try {
            OpenLibrarySubjectResponse response = restClient.get()
                    .uri("/subjects/{subject}.json?limit={limit}&offset={offset}", subject, limit, offset)
                    .retrieve()
                    .body(OpenLibrarySubjectResponse.class);

            return response != null && response.getWorks() != null ? response.getWorks() : List.of();
        } catch (Exception e) {
            log.warn("Impossibile recuperare le opere per la subject '{}': {}", subject, e.getMessage());
            return List.of();
        }
    }

    public List<OpenLibrarySearchResponse.Doc> searchByPublisher(String publisher, String language, int limit, int offset) {
        try {
            OpenLibrarySearchResponse response = restClient.get()
                    .uri("/search.json?q={q}&lang={lang}&fields={fields}&limit={limit}&offset={offset}",
                            "publisher:\"" + publisher + "\"", language, SEARCH_FIELDS, limit, offset)
                    .retrieve()
                    .body(OpenLibrarySearchResponse.class);

            return response != null && response.getDocs() != null ? response.getDocs() : List.of();
        } catch (Exception e) {
            log.warn("Impossibile cercare le opere dell'editore '{}': {}", publisher, e.getMessage());
            return List.of();
        }
    }
}
