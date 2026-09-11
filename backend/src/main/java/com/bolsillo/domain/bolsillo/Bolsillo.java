package com.bolsillo.domain.bolsillo;

import com.bolsillo.domain.exception.MontoExcedeObjetivoException;
import com.bolsillo.domain.exception.MontoInvalidoException;
import com.bolsillo.domain.money.Money;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Entidad raíz del agregado Bolsillo. Contiene las reglas de negocio puras:
 * monto > 0, no exceder el objetivo, completitud al 100%.
 */
public final class Bolsillo {

    private final Long id;
    private final String nombre;
    private final Money objetivo;
    private Money acumulado;

    private Bolsillo(Long id, String nombre, Money objetivo, Money acumulado) {
        this.id = id;
        this.nombre = nombre;
        this.objetivo = objetivo;
        this.acumulado = acumulado;
    }

    public static Bolsillo crear(Long id, String nombre, Money objetivo) {
        if (objetivo.valor().signum() <= 0) {
            throw new MontoInvalidoException("El monto objetivo debe ser mayor a cero");
        }
        return new Bolsillo(id, nombre, objetivo, Money.cero());
    }

    public static Bolsillo reconstruir(Long id, String nombre, Money objetivo, Money acumulado) {
        return new Bolsillo(id, nombre, objetivo, acumulado);
    }

    public void abonar(Money monto) {
        if (monto.valor().signum() <= 0) {
            throw new MontoInvalidoException("El monto del abono debe ser mayor a cero");
        }
        Money nuevoAcumulado = acumulado.sumar(monto);
        if (nuevoAcumulado.esMayorQue(objetivo)) {
            throw new MontoExcedeObjetivoException(
                    "El abono supera el objetivo del bolsillo '" + nombre + "'"
            );
        }
        acumulado = nuevoAcumulado;
    }

    public boolean estaCompleto() {
        return acumulado.esIgualA(objetivo);
    }

    public int progreso() {
        return acumulado.valor()
                .multiply(BigDecimal.valueOf(100))
                .divide(objetivo.valor(), 0, RoundingMode.DOWN)
                .intValue();
    }

    public Long id() {
        return id;
    }

    public String nombre() {
        return nombre;
    }

    public Money objetivo() {
        return objetivo;
    }

    public Money acumulado() {
        return acumulado;
    }
}