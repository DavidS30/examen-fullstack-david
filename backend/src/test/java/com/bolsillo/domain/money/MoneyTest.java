package com.bolsillo.domain.money;

import com.bolsillo.domain.exception.MontoInvalidoException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MoneyTest {

    @Test
    void crear_valorNulo_lanzaMontoInvalidoException() {
        assertThrows(MontoInvalidoException.class, () -> new Money(null));
    }

    @Test
    void crear_valorNegativo_lanzaMontoInvalidoException() {
        assertThrows(MontoInvalidoException.class, () -> new Money(new BigDecimal("-1")));
    }

    @Test
    void crear_valorCero_esValido() {
        Money cero = new Money(BigDecimal.ZERO);
        assertEquals(0, cero.valor().signum());
    }

    @Test
    void crear_valorPositivo_esValido() {
        Money monto = new Money(new BigDecimal("100.50"));
        assertEquals(0, monto.valor().compareTo(new BigDecimal("100.50")));
    }

    @Test
    void cero_retornaMontoCero() {
        assertEquals(0, Money.cero().valor().signum());
    }

    @Test
    void sumar_dosMontos_retornaSuma() {
        Money resultado = new Money(new BigDecimal("10")).sumar(new Money(new BigDecimal("5.5")));
        assertEquals(0, resultado.valor().compareTo(new BigDecimal("15.5")));
    }

    @Test
    void esMayorQue_montoMayor_retornaTrue() {
        assertTrue(new Money(new BigDecimal("10")).esMayorQue(new Money(new BigDecimal("9"))));
    }

    @Test
    void esMayorQue_montoMenor_retornaFalse() {
        assertFalse(new Money(new BigDecimal("9")).esMayorQue(new Money(new BigDecimal("10"))));
    }

    @Test
    void esIgualA_montosEquivalentes_retornaTrue() {
        assertTrue(new Money(new BigDecimal("10")).esIgualA(new Money(new BigDecimal("10.00"))));
    }

    @Test
    void esIgualA_montosDistintos_retornaFalse() {
        assertFalse(new Money(new BigDecimal("10")).esIgualA(new Money(new BigDecimal("11"))));
    }
}