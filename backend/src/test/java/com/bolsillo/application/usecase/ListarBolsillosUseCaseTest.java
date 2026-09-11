package com.bolsillo.application.usecase;

import com.bolsillo.domain.bolsillo.Bolsillo;
import com.bolsillo.domain.money.Money;
import com.bolsillo.support.InMemoryBolsilloRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ListarBolsillosUseCaseTest {

    private InMemoryBolsilloRepository repository;
    private ListarBolsillosUseCase useCase;

    @BeforeEach
    void setUp() {
        repository = new InMemoryBolsilloRepository();
        useCase = new ListarBolsillosUseCase(repository);
    }

    @Test
    void listar_conBolsillos_retornaTodos() {
        repository.save(Bolsillo.crear(null, "Vacaciones", new Money(new BigDecimal("1000"))));
        repository.save(Bolsillo.crear(null, "Emergencia", new Money(new BigDecimal("500"))));

        List<Bolsillo> resultado = useCase.listar();

        assertEquals(2, resultado.size());
    }

    @Test
    void listar_sinBolsillos_retornaListaVacia() {
        assertTrue(useCase.listar().isEmpty());
    }
}