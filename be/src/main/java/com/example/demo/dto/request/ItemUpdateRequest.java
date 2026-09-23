package com.example.demo.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ItemUpdateRequest {

    private String name;

    @DecimalMin(value = "0.0", inclusive = false, message = "Il prezzo deve essere positivo")
    private BigDecimal price;

    private String author;

    private String publisher;

    private String coverUrl;

    @Min(value = 0, message = "Lo stock non può essere negativo")
    private Integer stock;
}
