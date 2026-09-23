package com.example.demo.service;

import com.example.demo.dto.request.ItemCreateRequest;
import com.example.demo.dto.request.ItemUpdateRequest;
import com.example.demo.dto.response.ItemResponse;
import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Item;
import com.example.demo.model.User;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.UserFavouriteItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final UserFavouriteItemRepository favouriteItemRepository;
    private final PriceGeneratorService priceGeneratorService;

    public ItemService(ItemRepository itemRepository,
                        UserFavouriteItemRepository favouriteItemRepository,
                        PriceGeneratorService priceGeneratorService) {
        this.itemRepository = itemRepository;
        this.favouriteItemRepository = favouriteItemRepository;
        this.priceGeneratorService = priceGeneratorService;
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> getAll(Optional<User> currentUser) {
        Set<UUID> favouriteItemIds = currentUser
                .map(favouriteItemRepository::findByUser)
                .map(list -> list.stream().map(fav -> fav.getItem().getId()).collect(Collectors.toSet()))
                .orElseGet(Set::of);

        return itemRepository.findAll().stream()
                .map(item -> toResponse(item, favouriteItemIds.contains(item.getId())))
                .toList();
    }

    @Transactional
    public ItemResponse create(ItemCreateRequest request) {
        java.math.BigDecimal price = request.getPrice() != null ? request.getPrice() : priceGeneratorService.generate();
        Item item = new Item(request.getName(), price);
        item.setAuthor(request.getAuthor());
        item.setPublisher(request.getPublisher());
        item.setCoverUrl(request.getCoverUrl());
        item.setStock(request.getStock() != null ? request.getStock() : 0);
        itemRepository.save(item);
        return toResponse(item, false);
    }

    @Transactional
    public ItemResponse update(UUID id, ItemUpdateRequest request) {
        Item item = findItem(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            item.setName(request.getName());
        }
        if (request.getPrice() != null) {
            item.setPrice(request.getPrice());
        }
        if (request.getAuthor() != null) {
            item.setAuthor(request.getAuthor());
        }
        if (request.getPublisher() != null) {
            item.setPublisher(request.getPublisher());
        }
        if (request.getCoverUrl() != null) {
            item.setCoverUrl(request.getCoverUrl());
        }
        if (request.getStock() != null) {
            item.setStock(request.getStock());
        }

        return toResponse(item, false);
    }

    @Transactional
    public void delete(UUID id) {
        Item item = findItem(id);
        favouriteItemRepository.deleteByItem(item);
        itemRepository.delete(item);
    }

    @Transactional
    public void addFavourite(UUID itemId, User user) {
        Item item = findItem(itemId);

        if (favouriteItemRepository.existsByUserAndItem(user, item)) {
            throw new DuplicateResourceException("L'oggetto è già tra i preferiti");
        }

        favouriteItemRepository.save(new com.example.demo.model.UserFavouriteItem(user, item));
    }

    @Transactional
    public void removeFavourite(UUID itemId, User user) {
        Item item = findItem(itemId);

        if (!favouriteItemRepository.existsByUserAndItem(user, item)) {
            throw new ResourceNotFoundException("L'oggetto non è tra i preferiti");
        }

        favouriteItemRepository.deleteByUserAndItem(user, item);
    }

    private Item findItem(UUID id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto non trovato: " + id));
    }

    private ItemResponse toResponse(Item item, boolean favourite) {
        return new ItemResponse(item.getId(), item.getName(), item.getPrice(), item.getAuthor(), item.getPublisher(),
                item.getCoverUrl(), item.getStock(), item.getCreatedAt(), favourite);
    }
}
