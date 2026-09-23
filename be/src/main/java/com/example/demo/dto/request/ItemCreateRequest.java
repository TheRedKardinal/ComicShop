package com.example.demo.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ItemCreateRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    private String name;

    @DecimalMin(value = "0.0", inclusive = false, message = "Il prezzo deve essere positivo")
    private BigDecimal price;

    private String author;

    private String publisher;

    private String coverUrl;

    @Min(value = 0, message = "Lo stock non può essere negativo")
    private Integer stock;
}
