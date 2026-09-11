package com.bolsillo.infrastructure.web.dto;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String message,
        Map<String, String> errors
) {

    public static ErrorResponse of(HttpStatus status, String message) {
        return new ErrorResponse(LocalDateTime.now(), status.value(), message, Map.of());
    }

    public static ErrorResponse validation(HttpStatus status, Map<String, String> errors) {
        return new ErrorResponse(LocalDateTime.now(), status.value(), "Validación fallida", errors);
    }
}