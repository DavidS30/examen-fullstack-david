package com.bolsillo.infrastructure.events;

import com.bolsillo.domain.event.AbonoRegistradoEvent;
import com.bolsillo.domain.event.MetaAlcanzadaEvent;
import com.bolsillo.infrastructure.web.dto.BolsilloResponse;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Traduce los eventos de dominio a mensajes SSE dirigidos a los clientes
 * conectados. Encarna el patrón Observer/Pub-Sub de la infraestructura.
 */
@Component
public class SseEventTranslator {

    private final SseEmitterRegistry registry;

    public SseEventTranslator(SseEmitterRegistry registry) {
        this.registry = registry;
    }

    @EventListener
    public void onAbonoRegistrado(AbonoRegistradoEvent event) {
        registry.enviar("abono-registrado", BolsilloResponse.from(event.bolsillo()));
    }

    @EventListener
    public void onMetaAlcanzada(MetaAlcanzadaEvent event) {
        registry.enviar("meta-alcanzada", BolsilloResponse.from(event.bolsillo()));
    }
}