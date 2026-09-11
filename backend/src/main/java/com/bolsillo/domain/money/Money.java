package com.bolsillo.domain.money;

import com.bolsillo.domain.exception.MontoInvalidoException;

import java.math.BigDecimal;

/**
 * Value Object inmutable que representa dinero.
 * El dominio es Java puro: sin Spring, sin JPA.
 */
public record Money(BigDecimal valor) {

    public Money {
        if (valor == null) {
            throw new MontoInvalidoException("El monto no puede ser nulo");
        }
        if (valor.signum() < 0) {
            throw new MontoInvalidoException("El monto no puede ser negativo");
        }
    }

    public static Money cero() {
        return new Money(BigDecimal.ZERO);
    }

    public Money sumar(Money otro) {
        return new Money(valor.add(otro.valor));
    }

    public boolean esMayorQue(Money otro) {
        return valor.compareTo(otro.valor) > 0;
    }

    public boolean esMenorQue(Money otro) {
        return valor.compareTo(otro.valor) < 0;
    }

    public boolean esIgualA(Money otro) {
        return valor.compareTo(otro.valor) == 0;
    }
}