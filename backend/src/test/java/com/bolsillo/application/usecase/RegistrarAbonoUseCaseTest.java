package com.bolsillo.application.usecase;

import com.bolsillo.application.exception.BolsilloNoEncontradoException;
import com.bolsillo.application.ports.NotificadorPort;
import com.bolsillo.domain.bolsillo.Bolsillo;
import com.bolsillo.domain.event.AbonoRegistradoEvent;
import com.bolsillo.domain.event.MetaAlcanzadaEvent;
import com.bolsillo.domain.exception.MontoExcedeObjetivoException;
import com.bolsillo.domain.exception.MontoInvalidoException;
import com.bolsillo.domain.money.Money;
import com.bolsillo.support.InMemoryBolsilloRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class RegistrarAbonoUseCaseTest {

    private InMemoryBolsilloRepository repository;
    private NotificadorPort notificador;
    private RegistrarAbonoUseCase useCase;

    @BeforeEach
    void setUp() {
        repository = new InMemoryBolsilloRepository();
        notificador = mock(NotificadorPort.class);
        useCase = new RegistrarAbonoUseCase(repository, notificador);
    }

    private Bolsillo guardarBolsillo(String nombre, BigDecimal objetivo) {
        return repository.save(Bolsillo.crear(null, nombre, new Money(objetivo)));
    }

    @Test
    void registrarAbono_abonoValido_persisteYPublicaAbonoRegistradoEvent() {
        Bolsillo bolsillo = guardarBolsillo("Vacaciones", new BigDecimal("1000"));

        Bolsillo actualizado = useCase.registrarAbono(bolsillo.id(), new Money(new BigDecimal("250")));

        assertEquals(0, actualizado.acumulado().valor().compareTo(new BigDecimal("250")));
        Bolsillo persistido = repository.findById(bolsillo.id()).orElseThrow();
        assertEquals(0, persistido.acumulado().valor().compareTo(new BigDecimal("250")));

        verify(notificador).abonoRegistrado(any(AbonoRegistradoEvent.class));
        verify(notificador, never()).metaAlcanzada(any(MetaAlcanzadaEvent.class));
    }

    @Test
    void registrarAbono_montoCero_lanzaMontoInvalidoExceptionYNoPublicaEventos() {
        Bolsillo bolsillo = guardarBolsillo("Vacaciones", new BigDecimal("1000"));

        assertThrows(MontoInvalidoException.class,
                () -> useCase.registrarAbono(bolsillo.id(), new Money(BigDecimal.ZERO)));

        verify(notificador, never()).abonoRegistrado(any(AbonoRegistradoEvent.class));
        verify(notificador, never()).metaAlcanzada(any(MetaAlcanzadaEvent.class));
        assertEquals(0, repository.findById(bolsillo.id()).orElseThrow().acumulado().valor().signum());
    }

    @Test
    void registrarAbono_montoNegativo_lanzaMontoInvalidoExceptionYNoPublicaEventos() {
        Bolsillo bolsillo = guardarBolsillo("Vacaciones", new BigDecimal("1000"));

        assertThrows(MontoInvalidoException.class,
                () -> useCase.registrarAbono(bolsillo.id(), new Money(new BigDecimal("-100"))));

        verify(notificador, never()).abonoRegistrado(any(AbonoRegistradoEvent.class));
        verify(notificador, never()).metaAlcanzada(any(MetaAlcanzadaEvent.class));
        assertEquals(0, repository.findById(bolsillo.id()).orElseThrow().acumulado().valor().signum());
    }

    @Test
    void registrarAbono_abonoQueExcedeObjetivo_lanzaMontoExcedeObjetivoExceptionYNoPublicaEventos() {
        Bolsillo bolsillo = guardarBolsillo("Vacaciones", new BigDecimal("1000"));

        assertThrows(MontoExcedeObjetivoException.class,
                () -> useCase.registrarAbono(bolsillo.id(), new Money(new BigDecimal("1001"))));

        verify(notificador, never()).abonoRegistrado(any(AbonoRegistradoEvent.class));
        verify(notificador, never()).metaAlcanzada(any(MetaAlcanzadaEvent.class));
        assertEquals(0, repository.findById(bolsillo.id()).orElseThrow().acumulado().valor().signum());
    }

    @Test
    void registrarAbono_abonoQueCompletaMeta_publicaMetaAlcanzadaEvent() {
        Bolsillo bolsillo = guardarBolsillo("Vacaciones", new BigDecimal("1000"));

        Bolsillo actualizado = useCase.registrarAbono(bolsillo.id(), new Money(new BigDecimal("1000")));

        assertTrue(actualizado.estaCompleto());
        assertEquals(100, actualizado.progreso());

        InOrder inOrder = inOrder(notificador);
        inOrder.verify(notificador).abonoRegistrado(any(AbonoRegistradoEvent.class));
        inOrder.verify(notificador).metaAlcanzada(any(MetaAlcanzadaEvent.class));
    }

    @Test
    void registrarAbono_bolsilloNoExiste_lanzaBolsilloNoEncontradoExceptionYNoPublicaEventos() {
        assertThrows(BolsilloNoEncontradoException.class,
                () -> useCase.registrarAbono(999L, new Money(new BigDecimal("100"))));

        verify(notificador, never()).abonoRegistrado(any(AbonoRegistradoEvent.class));
        verify(notificador, never()).metaAlcanzada(any(MetaAlcanzadaEvent.class));
    }
}