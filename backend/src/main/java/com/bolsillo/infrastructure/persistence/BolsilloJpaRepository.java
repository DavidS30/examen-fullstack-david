package com.bolsillo.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BolsilloJpaRepository extends JpaRepository<BolsilloEntity, Long> {
}