package com.bolsillo.application.usecase;

import com.bolsillo.application.exception.BolsilloNoEncontradoException;
import com.bolsillo.domain.bolsillo.Bolsillo;
import com.bolsillo.domain.exception.ObjetivoInvalidoException;
import com.bolsillo.domain.money.Money;
import com.bolsillo.support.InMemoryBolsilloRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EditarBolsilloUseCaseTest {

    private InMemoryBolsilloRepository repository;
    private EditarBolsilloUseCase useCase;

    @BeforeEach
    void setUp() {
        repository = new InMemoryBolsilloRepository();
        useCase = new EditarBolsilloUseCase(repository);
    }

    @Test
    void editar_bolsilloExistente_persisteNuevoNombreYObjetivo() {
        Bolsillo bolsillo = repository.save(Bolsillo.crear(null, "Vacaciones", new Money(new BigDecimal("1000"))));
        bolsillo.abonar(new Money(new BigDecimal("250")));
        repository.save(bolsillo);

        Bolsillo editado = useCase.editar(bolsillo.id(), "Viaje a Cartagena", new Money(new BigDecimal("2000")));

        assertEquals("Viaje a Cartagena", editado.nombre());
        assertEquals(0, editado.objetivo().valor().compareTo(new BigDecimal("2000")));
        assertEquals(0, editado.acumulado().valor().compareTo(new BigDecimal("250")));
    }

    @Test
    void editar_objetivoMenorQueAcumulado_lanzaObjetivoInvalidoException() {
        Bolsillo bolsillo = repository.save(Bolsillo.crear(null, "Vacaciones", new Money(new BigDecimal("1000"))));
        bolsillo.abonar(new Money(new BigDecimal("800")));
        repository.save(bolsillo);

        assertThrows(ObjetivoInvalidoException.class,
                () -> useCase.editar(bolsillo.id(), "Vacaciones", new Money(new BigDecimal("500"))));
    }

    @Test
    void editar_bolsilloNoExiste_lanzaBolsilloNoEncontradoException() {
        assertThrows(BolsilloNoEncontradoException.class,
                () -> useCase.editar(999L, "X", new Money(new BigDecimal("1000"))));
    }
}