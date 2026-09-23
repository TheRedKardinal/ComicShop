package com.example.demo.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class ItemResponse {

    private UUID id;
    private String name;
    private BigDecimal price;
    private String author;
    private String publisher;
    private String coverUrl;
    private int stock;
    private Instant createdAt;
    private boolean favourite;

    public ItemResponse(UUID id, String name, BigDecimal price, String author, String publisher, String coverUrl,
                         int stock, Instant createdAt, boolean favourite) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.author = author;
        this.publisher = publisher;
        this.coverUrl = coverUrl;
        this.stock = stock;
        this.createdAt = createdAt;
        this.favourite = favourite;
    }
}
