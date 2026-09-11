package com.bolsillo.application.ports;

import com.bolsillo.domain.bolsillo.Bolsillo;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida (driven) para la persistencia de bolsillos.
 * El caso de uso no conoce JPA: solo esta interfaz.
 */
public interface BolsilloRepository {

    Optional<Bolsillo> findById(Long id);

    Bolsillo save(Bolsillo bolsillo);

    List<Bolsillo> findAll();
}