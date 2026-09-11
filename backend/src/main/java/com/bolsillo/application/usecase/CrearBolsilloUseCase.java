package com.bolsillo.application.usecase;

import com.bolsillo.application.ports.BolsilloRepository;
import com.bolsillo.domain.bolsillo.Bolsillo;
import com.bolsillo.domain.money.Money;

public class CrearBolsilloUseCase {

    private final BolsilloRepository repository;

    public CrearBolsilloUseCase(BolsilloRepository repository) {
        this.repository = repository;
    }

    public Bolsillo crear(String nombre, Money objetivo) {
        Bolsillo bolsillo = Bolsillo.crear(null, nombre, objetivo);
        return repository.save(bolsillo);
    }
}