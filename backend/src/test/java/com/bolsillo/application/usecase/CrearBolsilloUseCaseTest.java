package com.bolsillo.application.usecase;

import com.bolsillo.domain.bolsillo.Bolsillo;
import com.bolsillo.domain.exception.MontoInvalidoException;
import com.bolsillo.domain.money.Money;
import com.bolsillo.support.InMemoryBolsilloRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CrearBolsilloUseCaseTest {

    private InMemoryBolsilloRepository repository;
    private CrearBolsilloUseCase useCase;

    @BeforeEach
    void setUp() {
        repository = new InMemoryBolsilloRepository();
        useCase = new CrearBolsilloUseCase(repository);
    }

    @Test
    void crear_objetivoValido_persisteBolsilloConAcumuladoCero() {
        Bolsillo creado = useCase.crear("Vacaciones", new Money(new BigDecimal("1000")));

        assertNotNull(creado.id());
        assertEquals("Vacaciones", creado.nombre());
        assertEquals(0, creado.acumulado().valor().signum());
        assertTrue(repository.findById(creado.id()).isPresent());
    }

    @Test
    void crear_objetivoCero_lanzaMontoInvalidoExceptionYNoPersiste() {
        assertThrows(MontoInvalidoException.class,
                () -> useCase.crear("Vacaciones", new Money(BigDecimal.ZERO)));
        assertTrue(repository.findAll().isEmpty());
    }

    @Test
    void crear_objetivoNegativo_lanzaMontoInvalidoExceptionYNoPersiste() {
        assertThrows(MontoInvalidoException.class,
                () -> useCase.crear("Vacaciones", new Money(new BigDecimal("-100"))));
        assertTrue(repository.findAll().isEmpty());
    }
}