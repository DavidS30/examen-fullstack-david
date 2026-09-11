package com.bolsillo.domain.event;

import com.bolsillo.domain.bolsillo.Bolsillo;

/**
 * Evento de dominio emitido cuando un abono lleva la meta exactamente al 100%.
 * Dispara la notificación visual distintiva en la UI.
 */
public record MetaAlcanzadaEvent(Bolsillo bolsillo) {
}