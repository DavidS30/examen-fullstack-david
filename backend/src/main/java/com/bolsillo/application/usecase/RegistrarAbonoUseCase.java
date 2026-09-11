package com.bolsillo.application.usecase;

import com.bolsillo.application.exception.BolsilloNoEncontradoException;
import com.bolsillo.application.ports.BolsilloRepository;
import com.bolsillo.application.ports.NotificadorPort;
import com.bolsillo.domain.bolsillo.Bolsillo;
import com.bolsillo.domain.event.AbonoRegistradoEvent;
import com.bolsillo.domain.event.MetaAlcanzadaEvent;
import com.bolsillo.domain.money.Money;

public class RegistrarAbonoUseCase {

    private final BolsilloRepository repository;
    private final NotificadorPort notificador;

    public RegistrarAbonoUseCase(BolsilloRepository repository, NotificadorPort notificador) {
        this.repository = repository;
        this.notificador = notificador;
    }

    public Bolsillo registrarAbono(Long bolsilloId, Money monto) {
        Bolsillo bolsillo = repository.findById(bolsilloId)
                .orElseThrow(() -> new BolsilloNoEncontradoException(bolsilloId));

        boolean estabaCompleto = bolsillo.estaCompleto();
        bolsillo.abonar(monto);

        Bolsillo actualizado = repository.save(bolsillo);

        notificador.abonoRegistrado(new AbonoRegistradoEvent(actualizado));
        if (!estabaCompleto && actualizado.estaCompleto()) {
            notificador.metaAlcanzada(new MetaAlcanzadaEvent(actualizado));
        }
        return actualizado;
    }
}