package com.example.demo.repository;

import com.example.demo.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface ItemRepository extends JpaRepository<Item, UUID> {

    boolean existsByPublisher(String publisher);

    List<Item> findByCategoryIsNull();

    @Query("select i.openLibraryKey from Item i where i.openLibraryKey is not null")
    Set<String> findAllOpenLibraryKeys();
}
