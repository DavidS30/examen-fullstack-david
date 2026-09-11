package com.bolsillo.infrastructure.persistence;

import com.bolsillo.application.ports.BolsilloRepository;
import com.bolsillo.domain.bolsillo.Bolsillo;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class JpaBolsilloRepository implements BolsilloRepository {

    private final BolsilloJpaRepository jpaRepository;

    public JpaBolsilloRepository(BolsilloJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<Bolsillo> findById(Long id) {
        return jpaRepository.findById(id).map(BolsilloMapper::toDomain);
    }

    @Override
    public Bolsillo save(Bolsillo bolsillo) {
        BolsilloEntity entity = BolsilloMapper.toEntity(bolsillo);
        return BolsilloMapper.toDomain(jpaRepository.save(entity));
    }

    @Override
    public List<Bolsillo> findByArchivado(boolean archivado) {
        return jpaRepository.findByArchivado(archivado).stream()
                .map(BolsilloMapper::toDomain)
                .toList();
    }
}