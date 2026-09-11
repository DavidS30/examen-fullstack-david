package com.bolsillo.infrastructure.web.dto;

import com.bolsillo.domain.bolsillo.Bolsillo;

import java.math.BigDecimal;

public record BolsilloResponse(
        Long id,
        String nombre,
        BigDecimal objetivo,
        BigDecimal acumulado,
        int progreso,
        boolean completado,
        boolean archivado
) {

    public static BolsilloResponse from(Bolsillo bolsillo) {
        return new BolsilloResponse(
                bolsillo.id(),
                bolsillo.nombre(),
                bolsillo.objetivo().valor(),
                bolsillo.acumulado().valor(),
                bolsillo.progreso(),
                bolsillo.estaCompleto(),
                bolsillo.archivado()
        );
    }
}