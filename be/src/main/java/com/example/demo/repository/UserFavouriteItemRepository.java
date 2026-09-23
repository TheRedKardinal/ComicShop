package com.example.demo.repository;

import com.example.demo.model.Item;
import com.example.demo.model.User;
import com.example.demo.model.UserFavouriteItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserFavouriteItemRepository extends JpaRepository<UserFavouriteItem, UUID> {

    List<UserFavouriteItem> findByUser(User user);

    Optional<UserFavouriteItem> findByUserAndItem(User user, Item item);

    boolean existsByUserAndItem(User user, Item item);

    void deleteByUserAndItem(User user, Item item);

    void deleteByItem(Item item);
}
