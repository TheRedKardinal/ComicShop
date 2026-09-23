package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;

/**
 * Le API di catalogo usate (es. Open Library) non forniscono prezzo né stock,
 * quindi vengono generati casualmente in un range realistico da fumetteria.
 */
@Service
public class PriceGeneratorService {

    private static final BigDecimal MIN_PRICE = new BigDecimal("5.00");
    private static final BigDecimal MAX_PRICE = new BigDecimal("25.00");
    private static final int MAX_STOCK = 30;

    private final SecureRandom random = new SecureRandom();

    public BigDecimal generate() {
        double range = MAX_PRICE.subtract(MIN_PRICE).doubleValue();
        double value = MIN_PRICE.doubleValue() + random.nextDouble() * range;
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    public int generateStock() {
        return random.nextInt(MAX_STOCK + 1);
    }
}
