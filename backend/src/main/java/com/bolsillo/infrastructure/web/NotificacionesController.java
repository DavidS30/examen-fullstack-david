package com.bolsillo.infrastructure.web;

import com.bolsillo.infrastructure.events.SseEmitterRegistry;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionesController {

    private final SseEmitterRegistry registry;

    public NotificacionesController(SseEmitterRegistry registry) {
        this.registry = registry;
    }

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return registry.registrar();
    }
}