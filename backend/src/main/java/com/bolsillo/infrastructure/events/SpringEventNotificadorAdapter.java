package com.bolsillo.infrastructure.events;

import com.bolsillo.application.ports.NotificadorPort;
import com.bolsillo.domain.event.AbonoRegistradoEvent;
import com.bolsillo.domain.event.MetaAlcanzadaEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Adaptador del puerto NotificadorPort. Desacopla el caso de uso del
 * ApplicationEventPublisher de Spring: el caso de uso solo conoce la interfaz.
 */
@Component
public class SpringEventNotificadorAdapter implements NotificadorPort {

    private final ApplicationEventPublisher publisher;

    public SpringEventNotificadorAdapter(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    @Override
    public void abonoRegistrado(AbonoRegistradoEvent event) {
        publisher.publishEvent(event);
    }

    @Override
    public void metaAlcanzada(MetaAlcanzadaEvent event) {
        publisher.publishEvent(event);
    }
}