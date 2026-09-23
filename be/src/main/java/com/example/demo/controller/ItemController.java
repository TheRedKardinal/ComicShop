package com.example.demo.controller;

import com.example.demo.dto.request.ItemCreateRequest;
import com.example.demo.dto.request.ItemUpdateRequest;
import com.example.demo.dto.response.ItemResponse;
import com.example.demo.dto.response.MessageResponse;
import com.example.demo.security.CurrentUserProvider;
import com.example.demo.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;
    private final CurrentUserProvider currentUserProvider;

    public ItemController(ItemService itemService, CurrentUserProvider currentUserProvider) {
        this.itemService = itemService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAll() {
        return ResponseEntity.ok(itemService.getAll(currentUserProvider.getCurrentUser()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ItemResponse> create(@Valid @RequestBody ItemCreateRequest request) {
        return ResponseEntity.status(201).body(itemService.create(request));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ItemResponse> update(@PathVariable UUID id, @Valid @RequestBody ItemUpdateRequest request) {
        return ResponseEntity.ok(itemService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> delete(@PathVariable UUID id) {
        itemService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Oggetto eliminato con successo"));
    }

    @PostMapping("/{id}/favourites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> addFavourite(@PathVariable UUID id) {
        itemService.addFavourite(id, currentUserProvider.requireCurrentUser());
        return ResponseEntity.ok(new MessageResponse("Aggiunto ai preferiti"));
    }

    @DeleteMapping("/{id}/favourites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> removeFavourite(@PathVariable UUID id) {
        itemService.removeFavourite(id, currentUserProvider.requireCurrentUser());
        return ResponseEntity.ok(new MessageResponse("Rimosso dai preferiti"));
    }
}
