package com.bolsillo.infrastructure.web;

import com.bolsillo.infrastructure.events.SseEmitterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificacionesController.class)
class NotificacionesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SseEmitterRegistry sseEmitterRegistry;

    @Test
    void stream_clienteSeConecta_iniciaStreamingYRegistraEmitter() throws Exception {
        when(sseEmitterRegistry.registrar()).thenReturn(new SseEmitter());

        mockMvc.perform(get("/api/notificaciones")
                        .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
                .andExpect(status().isOk())
                .andExpect(request().asyncStarted());

        verify(sseEmitterRegistry).registrar();
    }
}