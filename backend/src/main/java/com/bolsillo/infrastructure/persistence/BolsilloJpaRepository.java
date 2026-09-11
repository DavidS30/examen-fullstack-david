package com.bolsillo.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BolsilloJpaRepository extends JpaRepository<BolsilloEntity, Long> {

    List<BolsilloEntity> findByArchivado(boolean archivado);
}