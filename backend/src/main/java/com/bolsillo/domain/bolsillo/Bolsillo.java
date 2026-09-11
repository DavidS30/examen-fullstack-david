package com.bolsillo.domain.bolsillo;

import com.bolsillo.domain.exception.MetaNoCompletadaException;
import com.bolsillo.domain.exception.MontoExcedeObjetivoException;
import com.bolsillo.domain.exception.MontoInvalidoException;
import com.bolsillo.domain.exception.ObjetivoInvalidoException;
import com.bolsillo.domain.money.Money;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Entidad raíz del agregado Bolsillo. Contiene las reglas de negocio puras:
 * monto > 0, no exceder el objetivo, completitud al 100% y archivado de metas completadas.
 */
public final class Bolsillo {

    private final Long id;
    private String nombre;
    private Money objetivo;
    private Money acumulado;
    private boolean archivado;

    private Bolsillo(Long id, String nombre, Money objetivo, Money acumulado, boolean archivado) {
        this.id = id;
        this.nombre = nombre;
        this.objetivo = objetivo;
        this.acumulado = acumulado;
        this.archivado = archivado;
    }

    public static Bolsillo crear(Long id, String nombre, Money objetivo) {
        if (nombre == null || nombre.isBlank()) {
            throw new MontoInvalidoException("El nombre del bolsillo no puede estar vacío");
        }
        if (objetivo.valor().signum() <= 0) {
            throw new MontoInvalidoException("El monto objetivo debe ser mayor a cero");
        }
        return new Bolsillo(id, nombre.trim(), objetivo, Money.cero(), false);
    }

    public static Bolsillo reconstruir(Long id, String nombre, Money objetivo, Money acumulado) {
        return reconstruir(id, nombre, objetivo, acumulado, false);
    }

    public static Bolsillo reconstruir(
            Long id,
            String nombre,
            Money objetivo,
            Money acumulado,
            boolean archivado
    ) {
        return new Bolsillo(id, nombre, objetivo, acumulado, archivado);
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

    public void archivar() {
        if (!estaCompleto()) {
            throw new MetaNoCompletadaException(
                    "Solo se pueden archivar metas completadas ('" + nombre + "' está al "
                            + progreso() + "%)"
            );
        }
        archivado = true;
    }

    public void restaurar() {
        archivado = false;
    }

    public void editar(String nuevoNombre, Money nuevoObjetivo) {
        if (nuevoNombre == null || nuevoNombre.isBlank()) {
            throw new MontoInvalidoException("El nombre del bolsillo no puede estar vacío");
        }
        if (nuevoObjetivo.valor().signum() <= 0) {
            throw new MontoInvalidoException("El monto objetivo debe ser mayor a cero");
        }
        if (nuevoObjetivo.esMenorQue(acumulado)) {
            throw new ObjetivoInvalidoException(
                    "El nuevo objetivo no puede ser menor que lo ya ahorrado ($"
                            + acumulado.valor() + ")"
            );
        }
        this.nombre = nuevoNombre.trim();
        this.objetivo = nuevoObjetivo;
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

    public boolean archivado() {
        return archivado;
    }
}