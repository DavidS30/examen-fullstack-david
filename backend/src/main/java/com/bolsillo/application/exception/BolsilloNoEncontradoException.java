package com.bolsillo.application.exception;

public class BolsilloNoEncontradoException extends RuntimeException {

    public BolsilloNoEncontradoException(Long id) {
        super("No existe un bolsillo con id " + id);
    }
}