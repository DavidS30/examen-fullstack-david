package com.bolsillo.application.usecase;

import com.bolsillo.application.exception.BolsilloNoEncontradoException;
import com.bolsillo.application.ports.BolsilloRepository;
import com.bolsillo.domain.bolsillo.Bolsillo;
import com.bolsillo.domain.money.Money;

public class EditarBolsilloUseCase {

    private final BolsilloRepository repository;

    public EditarBolsilloUseCase(BolsilloRepository repository) {
        this.repository = repository;
    }

    public Bolsillo editar(Long id, String nombre, Money objetivo) {
        Bolsillo bolsillo = repository.findById(id)
                .orElseThrow(() -> new BolsilloNoEncontradoException(id));
        bolsillo.editar(nombre, objetivo);
        return repository.save(bolsillo);
    }
}