package com.bolsillo.application.usecase;

import com.bolsillo.application.ports.BolsilloRepository;
import com.bolsillo.domain.bolsillo.Bolsillo;

import java.util.List;

public class ListarBolsillosUseCase {

    private final BolsilloRepository repository;

    public ListarBolsillosUseCase(BolsilloRepository repository) {
        this.repository = repository;
    }

    public List<Bolsillo> listar() {
        return repository.findAll();
    }
}