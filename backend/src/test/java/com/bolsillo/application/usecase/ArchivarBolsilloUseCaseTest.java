package com.bolsillo.application.usecase;

import com.bolsillo.application.exception.BolsilloNoEncontradoException;
import com.bolsillo.domain.bolsillo.Bolsillo;
import com.bolsillo.domain.exception.MetaNoCompletadaException;
import com.bolsillo.domain.money.Money;
import com.bolsillo.support.InMemoryBolsilloRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ArchivarBolsilloUseCaseTest {

    private InMemoryBolsilloRepository repository;
    private ArchivarBolsilloUseCase useCase;

    @BeforeEach
    void setUp() {
        repository = new InMemoryBolsilloRepository();
        useCase = new ArchivarBolsilloUseCase(repository);
    }

    private Bolsillo guardarCompletada(String nombre, BigDecimal objetivo) {
        Bolsillo bolsillo = repository.save(Bolsillo.crear(null, nombre, new Money(objetivo)));
        bolsillo.abonar(new Money(objetivo));
        return repository.save(bolsillo);
    }

    @Test
    void archivar_metaCompletada_persisteArchivadoYNoApareceEnActivas() {
        Bolsillo completada = guardarCompletada("Vacaciones", new BigDecimal("1000"));

        Bolsillo archivada = useCase.archivar(completada.id());

        assertTrue(archivada.archivado());
        assertTrue(repository.findByArchivado(true).stream().anyMatch(b -> b.id().equals(completada.id())));
        assertFalse(repository.findByArchivado(false).stream().anyMatch(b -> b.id().equals(completada.id())));
    }

    @Test
    void archivar_metaNoCompletada_lanzaMetaNoCompletadaException() {
        Bolsillo enProgreso = repository.save(Bolsillo.crear(null, "Laptop", new Money(new BigDecimal("2000"))));

        assertThrows(MetaNoCompletadaException.class, () -> useCase.archivar(enProgreso.id()));
        assertFalse(repository.findByArchivado(true).stream().anyMatch(b -> b.id().equals(enProgreso.id())));
    }

    @Test
    void archivar_bolsilloNoExiste_lanzaBolsilloNoEncontradoException() {
        assertThrows(BolsilloNoEncontradoException.class, () -> useCase.archivar(999L));
    }

    @Test
    void restaurar_metaArchivada_laDevuelveALasActivas() {
        Bolsillo completada = guardarCompletada("Vacaciones", new BigDecimal("1000"));
        Bolsillo archivada = useCase.archivar(completada.id());

        Bolsillo restaurada = useCase.restaurar(archivada.id());

        assertFalse(restaurada.archivado());
        assertTrue(repository.findByArchivado(false).stream().anyMatch(b -> b.id().equals(archivada.id())));
        assertTrue(repository.findByArchivado(true).isEmpty());
    }

    @Test
    void restaurar_bolsilloNoExiste_lanzaBolsilloNoEncontradoException() {
        assertThrows(BolsilloNoEncontradoException.class, () -> useCase.restaurar(999L));
    }
}