package com.bolsillo.domain.event;

import com.bolsillo.domain.bolsillo.Bolsillo;

/**
 * Evento de dominio publicado tras un abono válido. Transporta el estado
 * actualizado del bolsillo para que la infraestructura lo traduzca a SSE.
 */
public record AbonoRegistradoEvent(Bolsillo bolsillo) {
}