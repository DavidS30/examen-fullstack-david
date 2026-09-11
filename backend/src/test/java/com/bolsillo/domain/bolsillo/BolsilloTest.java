package com.bolsillo.domain.bolsillo;

import com.bolsillo.domain.exception.MetaNoCompletadaException;
import com.bolsillo.domain.exception.MontoExcedeObjetivoException;
import com.bolsillo.domain.exception.MontoInvalidoException;
import com.bolsillo.domain.money.Money;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BolsilloTest {

    private static final Money OBJETIVO = new Money(new BigDecimal("1000"));

    @Test
    void crear_objetivoCero_lanzaMontoInvalidoException() {
        assertThrows(MontoInvalidoException.class,
                () -> Bolsillo.crear(null, "Vacaciones", new Money(BigDecimal.ZERO)));
    }

    @Test
    void crear_objetivoNegativo_lanzaMontoInvalidoException() {
        assertThrows(MontoInvalidoException.class,
                () -> Bolsillo.crear(null, "Vacaciones", new Money(new BigDecimal("-500"))));
    }

    @Test
    void crear_objetivoValido_acumuladoIniciaEnCero() {
        Bolsillo bolsillo = Bolsillo.crear(null, "Vacaciones", OBJETIVO);
        assertEquals(0, bolsillo.acumulado().valor().signum());
        assertFalse(bolsillo.estaCompleto());
    }

    @Test
    void abonar_montoCero_lanzaMontoInvalidoException() {
        Bolsillo bolsillo = Bolsillo.crear(null, "Vacaciones", OBJETIVO);
        assertThrows(MontoInvalidoException.class,
                () -> bolsillo.abonar(new Money(BigDecimal.ZERO)));
    }

    @Test
    void abonar_montoNegativo_lanzaMontoInvalidoException() {
        Bolsillo bolsillo = Bolsillo.crear(null, "Vacaciones", OBJETIVO);
        assertThrows(MontoInvalidoException.class,
                () -> bolsillo.abonar(new Money(new BigDecimal("-100"))));
    }

    @Test
    void abonar_montoQueExcedeObjetivo_lanzaMontoExcedeObjetivoException() {
        Bolsillo bolsillo = Bolsillo.crear(null, "Vacaciones", OBJETIVO);
        assertThrows(MontoExcedeObjetivoException.class,
                () -> bolsillo.abonar(new Money(new BigDecimal("1001"))));
    }

    @Test
    void abonar_montoValido_acumuladoAumenta() {
        Bolsillo bolsillo = Bolsillo.crear(null, "Vacaciones", OBJETIVO);
        bolsillo.abonar(new Money(new BigDecimal("250")));
        assertEquals(0, bolsillo.acumulado().valor().compareTo(new BigDecimal("250")));
        assertFalse(bolsillo.estaCompleto());
    }

    @Test
    void abonar_montoQueCompletaMeta_estaCompletoRetornaTrue() {
        Bolsillo bolsillo = Bolsillo.crear(null, "Vacaciones", OBJETIVO);
        bolsillo.abonar(OBJETIVO);
        assertTrue(bolsillo.estaCompleto());
    }

    @Test
    void abonar_montoQueCompletaMeta_progresoRetorna100() {
        Bolsillo bolsillo = Bolsillo.crear(null, "Vacaciones", OBJETIVO);
        bolsillo.abonar(OBJETIVO);
        assertEquals(100, bolsillo.progreso());
    }

    @Test
    void estaCompleto_acumuladoMenorQueObjetivo_retornaFalse() {
        Bolsillo bolsillo = Bolsillo.reconstruir(1L, "Vacaciones", OBJETIVO, new Money(new BigDecimal("999")));
        assertFalse(bolsillo.estaCompleto());
    }

    @Test
    void progreso_acumuladoParcial_retornaPorcentaje() {
        Bolsillo bolsillo = Bolsillo.reconstruir(1L, "Vacaciones", OBJETIVO, new Money(new BigDecimal("250")));
        assertEquals(25, bolsillo.progreso());
    }

    @Test
    void reconstruir_conEstadoPrevios_mantieneValores() {
        Bolsillo bolsillo = Bolsillo.reconstruir(7L, "Viaje", OBJETIVO, new Money(new BigDecimal("400")));
        assertEquals(7L, bolsillo.id());
        assertEquals("Viaje", bolsillo.nombre());
        assertEquals(0, bolsillo.acumulado().valor().compareTo(new BigDecimal("400")));
        assertFalse(bolsillo.archivado());
    }

    @Test
    void archivar_metaCompletada_laArchiva() {
        Bolsillo bolsillo = Bolsillo.reconstruir(1L, "Vacaciones", OBJETIVO, OBJETIVO);

        bolsillo.archivar();

        assertTrue(bolsillo.archivado());
    }

    @Test
    void archivar_metaNoCompletada_lanzaMetaNoCompletadaException() {
        Bolsillo bolsillo = Bolsillo.reconstruir(1L, "Vacaciones", OBJETIVO, new Money(new BigDecimal("250")));

        assertThrows(MetaNoCompletadaException.class, bolsillo::archivar);
        assertFalse(bolsillo.archivado());
    }

    @Test
    void restaurar_metaArchivada_laDevuelveAlDashboard() {
        Bolsillo bolsillo = Bolsillo.reconstruir(1L, "Vacaciones", OBJETIVO, OBJETIVO, true);

        bolsillo.restaurar();

        assertFalse(bolsillo.archivado());
    }
}