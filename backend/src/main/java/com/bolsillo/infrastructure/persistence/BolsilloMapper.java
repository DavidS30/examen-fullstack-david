package com.bolsillo.infrastructure.persistence;

import com.bolsillo.domain.bolsillo.Bolsillo;
import com.bolsillo.domain.money.Money;

public final class BolsilloMapper {

    private BolsilloMapper() {
    }

    public static Bolsillo toDomain(BolsilloEntity entity) {
        return Bolsillo.reconstruir(
                entity.getId(),
                entity.getNombre(),
                new Money(entity.getObjetivo()),
                new Money(entity.getAcumulado()),
                entity.isArchivado()
        );
    }

    public static BolsilloEntity toEntity(Bolsillo bolsillo) {
        return new BolsilloEntity(
                bolsillo.id(),
                bolsillo.nombre(),
                bolsillo.objetivo().valor(),
                bolsillo.acumulado().valor(),
                bolsillo.archivado()
        );
    }
}