package com.example.demo.config;

import com.example.demo.integration.openlibrary.OpenLibraryClient;
import com.example.demo.integration.openlibrary.OpenLibraryProperties;
import com.example.demo.integration.openlibrary.OpenLibrarySearchResponse;
import com.example.demo.integration.openlibrary.OpenLibrarySubjectResponse;
import com.example.demo.model.ComicCategory;
import com.example.demo.model.Item;
import com.example.demo.repository.ItemRepository;
import com.example.demo.service.PriceGeneratorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Importa il catalogo fumetti da Open Library e lo salva nel DB, così l'API
 * esterna non viene richiamata ad ogni richiesta.
 *
 * - Editori (app.open-library.publishers): ognuno viene importato solo se nel
 *   DB non c'è ancora nessun fumetto con quell'etichetta. Aggiungere un editore
 *   in application.yml basta a farlo comparire al riavvio successivo, senza
 *   svuotare la tabella (e quindi senza perdere i preferiti degli utenti).
 * - Subject generiche (comics, manga...): riempiono il catalogo senza editore
 *   noto, solo al primo avvio con la tabella vuota.
 * - I fumetti già presenti senza categoria la ricevono in base all'editore.
 */
@Component
@Order(2)
public class ComicCatalogSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ComicCatalogSeeder.class);

    private final OpenLibraryClient openLibraryClient;
    private final ItemRepository itemRepository;
    private final PriceGeneratorService priceGeneratorService;
    private final OpenLibraryProperties properties;

    public ComicCatalogSeeder(OpenLibraryClient openLibraryClient,
                               ItemRepository itemRepository,
                               PriceGeneratorService priceGeneratorService,
                               OpenLibraryProperties properties) {
        this.openLibraryClient = openLibraryClient;
        this.itemRepository = itemRepository;
        this.priceGeneratorService = priceGeneratorService;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(String... args) {
        assignMissingCategories();

        boolean emptyCatalog = itemRepository.count() == 0;
        Set<String> knownKeys = itemRepository.findAllOpenLibraryKeys();
        List<Item> imported = new ArrayList<>();

        for (OpenLibraryProperties.Publisher publisher : properties.getPublishers()) {
            if (!itemRepository.existsByPublisher(publisher.getLabel())) {
                importPublisher(publisher, knownKeys, imported);
            }
        }

        if (emptyCatalog) {
            properties.getSubjects().forEach((subject, category) -> importSubject(subject, category, knownKeys, imported));
        }

        if (imported.isEmpty()) {
            return;
        }

        itemRepository.saveAll(imported);
        log.info("Importati {} fumetti da Open Library", imported.size());
    }

    private void assignMissingCategories() {
        List<Item> uncategorized = itemRepository.findByCategoryIsNull();
        uncategorized.forEach(item -> item.setCategory(properties.categoryOf(item.getPublisher())));
        if (!uncategorized.isEmpty()) {
            log.info("Assegnata la categoria a {} fumetti già presenti", uncategorized.size());
        }
    }

    private void importPublisher(OpenLibraryProperties.Publisher publisher, Set<String> knownKeys, List<Item> imported) {
        int added = 0;

        for (int page = 0; page < properties.getPages() && added < properties.getPerPublisher(); page++) {
            List<OpenLibrarySearchResponse.Doc> docs = openLibraryClient.searchByPublisher(
                    publisher.getQuery(), properties.getLanguage(), properties.getLimit(), page * properties.getLimit());

            for (OpenLibrarySearchResponse.Doc doc : docs) {
                if (added >= properties.getPerPublisher()) {
                    break;
                }

                // L'edizione italiana, se c'è, vince su titolo e copertina dell'opera.
                OpenLibrarySearchResponse.Edition edition = doc.bestEdition();
                String title = edition != null && edition.getTitle() != null ? edition.getTitle() : doc.getTitle();
                Long coverId = edition != null && edition.getCoverId() != null ? edition.getCoverId() : doc.getCoverId();
                String author = doc.getAuthorNames() != null && !doc.getAuthorNames().isEmpty()
                        ? doc.getAuthorNames().get(0) : null;

                if (doc.getKey() == null || title == null || coverId == null || !knownKeys.add(doc.getKey())) {
                    continue;
                }

                imported.add(newItem(doc.getKey(), title, author, coverId, publisher.getLabel(), publisher.getCategory()));
                added++;
            }

            if (docs.size() < properties.getLimit()) {
                break;
            }
        }

        log.info("Editore '{}': {} fumetti trovati", publisher.getLabel(), added);
    }

    private void importSubject(String subject, ComicCategory category, Set<String> knownKeys, List<Item> imported) {
        for (int page = 0; page < properties.getPages() && imported.size() < properties.getMaxItems(); page++) {
            int offset = page * properties.getLimit();
            List<OpenLibrarySubjectResponse.Work> works =
                    openLibraryClient.fetchSubjectWorks(subject, properties.getLimit(), offset);

            for (OpenLibrarySubjectResponse.Work work : works) {
                if (imported.size() >= properties.getMaxItems()) {
                    break;
                }
                if (work.getKey() == null || work.getTitle() == null || work.getCoverId() == null
                        || !knownKeys.add(work.getKey())) {
                    continue;
                }

                String author = work.getAuthors() != null && !work.getAuthors().isEmpty()
                        ? work.getAuthors().get(0).getName() : null;
                imported.add(newItem(work.getKey(), work.getTitle(), author, work.getCoverId(), null, category));
            }
        }
    }

    private Item newItem(String key, String title, String author, Long coverId, String publisher, ComicCategory category) {
        Item item = new Item(title, priceGeneratorService.generate());
        item.setOpenLibraryKey(key);
        item.setAuthor(author);
        item.setPublisher(publisher);
        item.setCategory(category);
        item.setCoverUrl("https://covers.openlibrary.org/b/id/" + coverId + "-M.jpg");
        item.setStock(priceGeneratorService.generateStock());
        return item;
    }
}
