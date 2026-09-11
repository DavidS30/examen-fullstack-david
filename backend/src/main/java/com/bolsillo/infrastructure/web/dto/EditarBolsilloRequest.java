package com.bolsillo.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record EditarBolsilloRequest(
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        @NotNull(message = "El monto objetivo es obligatorio")
        @Positive(message = "El monto objetivo debe ser mayor a cero")
        BigDecimal objetivo
) {
}