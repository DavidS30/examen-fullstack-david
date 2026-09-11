package com.bolsillo.support;

import com.bolsillo.application.ports.BolsilloRepository;
import com.bolsillo.domain.bolsillo.Bolsillo;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Fake in-memory del puerto {@link BolsilloRepository} para tests de casos de uso.
 * No toca la base real (H2/JPA): simula la persistencia con una lista.
 */
public final class InMemoryBolsilloRepository implements BolsilloRepository {

    private final List<Bolsillo> bolsillos = new ArrayList<>();
    private final AtomicLong secuencia = new AtomicLong(1);

    @Override
    public Optional<Bolsillo> findById(Long id) {
        return bolsillos.stream()
                .filter(b -> b.id() != null && b.id().equals(id))
                .findFirst();
    }

    @Override
    public Bolsillo save(Bolsillo bolsillo) {
        if (bolsillo.id() == null) {
            Bolsillo conId = Bolsillo.reconstruir(
                    secuencia.getAndIncrement(),
                    bolsillo.nombre(),
                    bolsillo.objetivo(),
                    bolsillo.acumulado(),
                    bolsillo.archivado()
            );
            bolsillos.add(conId);
            return conId;
        }
        bolsillos.removeIf(b -> b.id().equals(bolsillo.id()));
        bolsillos.add(bolsillo);
        return bolsillo;
    }

    @Override
    public List<Bolsillo> findByArchivado(boolean archivado) {
        return bolsillos.stream()
                .filter(b -> b.archivado() == archivado)
                .toList();
    }
}