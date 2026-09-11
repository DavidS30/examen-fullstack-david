package com.bolsillo.application.usecase;

import com.bolsillo.application.exception.BolsilloNoEncontradoException;
import com.bolsillo.application.ports.BolsilloRepository;
import com.bolsillo.domain.bolsillo.Bolsillo;

public class ArchivarBolsilloUseCase {

    private final BolsilloRepository repository;

    public ArchivarBolsilloUseCase(BolsilloRepository repository) {
        this.repository = repository;
    }

    public Bolsillo archivar(Long id) {
        Bolsillo bolsillo = repository.findById(id)
                .orElseThrow(() -> new BolsilloNoEncontradoException(id));
        bolsillo.archivar();
        return repository.save(bolsillo);
    }

    public Bolsillo restaurar(Long id) {
        Bolsillo bolsillo = repository.findById(id)
                .orElseThrow(() -> new BolsilloNoEncontradoException(id));
        bolsillo.restaurar();
        return repository.save(bolsillo);
    }
}