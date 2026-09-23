package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private String author;

    private String publisher;

    @Column(name = "cover_url")
    private String coverUrl;

    @Column(nullable = false)
    private int stock;

    @Column(name = "open_library_key", unique = true)
    private String openLibraryKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Item(String name, BigDecimal price) {
        this.name = name;
        this.price = price;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
