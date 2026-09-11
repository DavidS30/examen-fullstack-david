package com.bolsillo.infrastructure.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "bolsillo")
public class BolsilloEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private BigDecimal objetivo;

    private BigDecimal acumulado;

    protected BolsilloEntity() {
    }

    public BolsilloEntity(Long id, String nombre, BigDecimal objetivo, BigDecimal acumulado) {
        this.id = id;
        this.nombre = nombre;
        this.objetivo = objetivo;
        this.acumulado = acumulado;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public BigDecimal getObjetivo() {
        return objetivo;
    }

    public BigDecimal getAcumulado() {
        return acumulado;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setObjetivo(BigDecimal objetivo) {
        this.objetivo = objetivo;
    }

    public void setAcumulado(BigDecimal acumulado) {
        this.acumulado = acumulado;
    }
}