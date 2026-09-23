package com.example.demo.config;

import com.example.demo.integration.openlibrary.OpenLibraryClient;
import com.example.demo.integration.openlibrary.OpenLibraryProperties;
import com.example.demo.integration.openlibrary.OpenLibrarySubjectResponse;
import com.example.demo.model.Item;
import com.example.demo.repository.ItemRepository;
import com.example.demo.service.PriceGeneratorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Importa il catalogo fumetti da Open Library una sola volta all'avvio
 * (se la tabella items è vuota) e lo salva nel DB, così l'API esterna
 * non viene richiamata ad ogni richiesta.
 *
 * Le subject dedicate (es. marvel_comics, dc_comics) vengono importate per
 * prime così da poter taggare correttamente il publisher; le subject generiche
 * (comics, graphic_novels) riempiono il resto del catalogo senza publisher noto.
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
        if (itemRepository.count() > 0) {
            return;
        }

        Map<String, Item> itemsByKey = new LinkedHashMap<>();

        properties.getPublisherSubjects()
                .forEach((subject, publisher) -> importSubject(subject, publisher, itemsByKey));

        for (String subject : properties.getSubjects()) {
            importSubject(subject, null, itemsByKey);
        }

        if (itemsByKey.isEmpty()) {
            log.warn("Nessun fumetto importato da Open Library: il catalogo resta vuoto");
            return;
        }

        itemRepository.saveAll(itemsByKey.values());
        log.info("Importati {} fumetti da Open Library", itemsByKey.size());
    }

    private void importSubject(String subject, String publisher, Map<String, Item> itemsByKey) {
        for (int page = 0; page < properties.getPages() && itemsByKey.size() < properties.getMaxItems(); page++) {
            int offset = page * properties.getLimit();
            List<OpenLibrarySubjectResponse.Work> works =
                    openLibraryClient.fetchSubjectWorks(subject, properties.getLimit(), offset);

            for (OpenLibrarySubjectResponse.Work work : works) {
                if (itemsByKey.size() >= properties.getMaxItems()) {
                    break;
                }
                if (work.getKey() == null || work.getTitle() == null || work.getCoverId() == null) {
                    continue;
                }
                itemsByKey.computeIfAbsent(work.getKey(), key -> toItem(work, publisher));
            }
        }
    }

    private Item toItem(OpenLibrarySubjectResponse.Work work, String publisher) {
        Item item = new Item(work.getTitle(), priceGeneratorService.generate());
        item.setOpenLibraryKey(work.getKey());
        item.setPublisher(publisher);
        item.setCoverUrl("https://covers.openlibrary.org/b/id/" + work.getCoverId() + "-M.jpg");
        item.setStock(priceGeneratorService.generateStock());

        if (work.getAuthors() != null && !work.getAuthors().isEmpty()) {
            item.setAuthor(work.getAuthors().get(0).getName());
        }

        return item;
    }
}
