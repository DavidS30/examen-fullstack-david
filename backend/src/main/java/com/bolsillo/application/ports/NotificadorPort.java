package com.bolsillo.application.ports;

import com.bolsillo.domain.event.AbonoRegistradoEvent;
import com.bolsillo.domain.event.MetaAlcanzadaEvent;

/**
 * Puerto de salida (driven) para la notificación en tiempo real.
 * Desacopla el dominio/aplicación del mecanismo concreto (SSE, WebSocket...).
 */
public interface NotificadorPort {

    void abonoRegistrado(AbonoRegistradoEvent event);

    void metaAlcanzada(MetaAlcanzadaEvent event);
}