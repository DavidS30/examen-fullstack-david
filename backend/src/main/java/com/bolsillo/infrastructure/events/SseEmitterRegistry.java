package com.bolsillo.infrastructure.events;

import com.bolsillo.infrastructure.web.dto.BolsilloResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Registro de conexiones SSE activas. Cada cliente que abre
 * /api/notificaciones queda registrado aquí y recibe los eventos de dominio.
 */
@Component
public class SseEmitterRegistry {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter registrar() {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));
        return emitter;
    }

    public void enviar(String evento, BolsilloResponse datos) {
        emitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event().name(evento).data(datos));
            } catch (IOException e) {
                emitters.remove(emitter);
                emitter.completeWithError(e);
            }
        });
    }
}