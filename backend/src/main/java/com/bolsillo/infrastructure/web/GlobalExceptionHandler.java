package com.bolsillo.infrastructure.web;

import com.bolsillo.application.exception.BolsilloNoEncontradoException;
import com.bolsillo.domain.exception.MetaNoCompletadaException;
import com.bolsillo.domain.exception.MontoExcedeObjetivoException;
import com.bolsillo.domain.exception.MontoInvalidoException;
import com.bolsillo.infrastructure.web.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MontoInvalidoException.class)
    public ResponseEntity<ErrorResponse> handleMontoInvalido(MontoInvalidoException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MontoExcedeObjetivoException.class)
    public ResponseEntity<ErrorResponse> handleMontoExcede(MontoExcedeObjetivoException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(BolsilloNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleNoEncontrado(BolsilloNoEncontradoException ex) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(MetaNoCompletadaException.class)
    public ResponseEntity<ErrorResponse> handleMetaNoCompletada(MetaNoCompletadaException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = error instanceof FieldError fieldError ? fieldError.getField() : error.getObjectName();
            errors.put(field, error.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(ErrorResponse.validation(HttpStatus.BAD_REQUEST, errors));
    }

    private ResponseEntity<ErrorResponse> buildError(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(ErrorResponse.of(status, message));
    }
}