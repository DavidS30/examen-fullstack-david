package com.bolsillo.infrastructure.web;

import com.bolsillo.application.exception.BolsilloNoEncontradoException;
import com.bolsillo.application.usecase.ArchivarBolsilloUseCase;
import com.bolsillo.application.usecase.CrearBolsilloUseCase;
import com.bolsillo.application.usecase.ListarBolsillosUseCase;
import com.bolsillo.application.usecase.RegistrarAbonoUseCase;
import com.bolsillo.domain.bolsillo.Bolsillo;
import com.bolsillo.domain.exception.MetaNoCompletadaException;
import com.bolsillo.domain.exception.MontoExcedeObjetivoException;
import com.bolsillo.domain.exception.MontoInvalidoException;
import com.bolsillo.domain.money.Money;
import com.bolsillo.infrastructure.events.SseEmitterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BolsilloController.class)
class BolsilloControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CrearBolsilloUseCase crearBolsilloUseCase;

    @MockBean
    private ListarBolsillosUseCase listarBolsillosUseCase;

    @MockBean
    private RegistrarAbonoUseCase registrarAbonoUseCase;

    @MockBean
    private ArchivarBolsilloUseCase archivarBolsilloUseCase;

    @MockBean
    private SseEmitterRegistry sseEmitterRegistry;

    private static Bolsillo bolsilloParcial() {
        return Bolsillo.reconstruir(1L, "Vacaciones", new Money(new BigDecimal("1000")), new Money(new BigDecimal("250")));
    }

    private static Bolsillo bolsilloCompleto() {
        return Bolsillo.reconstruir(1L, "Vacaciones", new Money(new BigDecimal("1000")), new Money(new BigDecimal("1000")));
    }

    private static Bolsillo bolsilloCompletoArchivado() {
        return Bolsillo.reconstruir(1L, "Vacaciones", new Money(new BigDecimal("1000")), new Money(new BigDecimal("1000")), true);
    }

    @Test
    void listar_conBolsillos_retorna200YListaConDatos() throws Exception {
        when(listarBolsillosUseCase.listar()).thenReturn(List.of(bolsilloParcial()));

        mockMvc.perform(get("/api/bolsillos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nombre").value("Vacaciones"))
                .andExpect(jsonPath("$[0].objetivo").value(1000))
                .andExpect(jsonPath("$[0].acumulado").value(250))
                .andExpect(jsonPath("$[0].progreso").value(25))
                .andExpect(jsonPath("$[0].completado").value(false));
    }

    @Test
    void listar_sinBolsillos_retorna200YListaVacia() throws Exception {
        when(listarBolsillosUseCase.listar()).thenReturn(List.of());

        mockMvc.perform(get("/api/bolsillos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void crear_requestValido_retorna201YBody() throws Exception {
        when(crearBolsilloUseCase.crear(eq("Vacaciones"), any(Money.class)))
                .thenReturn(bolsilloParcial());

        mockMvc.perform(post("/api/bolsillos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Vacaciones\",\"objetivo\":1000}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nombre").value("Vacaciones"))
                .andExpect(jsonPath("$.objetivo").value(1000))
                .andExpect(jsonPath("$.acumulado").value(250))
                .andExpect(jsonPath("$.progreso").value(25));
    }

    @Test
    void crear_objetivoCero_retorna400PorValidacion() throws Exception {
        mockMvc.perform(post("/api/bolsillos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Vacaciones\",\"objetivo\":0}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crear_objetivoNegativo_retorna400PorValidacion() throws Exception {
        mockMvc.perform(post("/api/bolsillos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Vacaciones\",\"objetivo\":-500}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crear_nombreVacio_retorna400PorValidacion() throws Exception {
        mockMvc.perform(post("/api/bolsillos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"\",\"objetivo\":1000}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crear_objetivoNulo_retorna400PorValidacion() throws Exception {
        mockMvc.perform(post("/api/bolsillos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Vacaciones\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crear_montoInvalidoLanzadoPorCasoDeUso_retorna400() throws Exception {
        when(crearBolsilloUseCase.crear(eq("Vacaciones"), any(Money.class)))
                .thenThrow(new MontoInvalidoException("El monto objetivo debe ser mayor a cero"));

        mockMvc.perform(post("/api/bolsillos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Vacaciones\",\"objetivo\":1000}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void abonar_abonoValido_retorna200YBody() throws Exception {
        when(registrarAbonoUseCase.registrarAbono(eq(1L), any(Money.class)))
                .thenReturn(bolsilloParcial());

        mockMvc.perform(post("/api/bolsillos/1/abonos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monto\":250}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.acumulado").value(250))
                .andExpect(jsonPath("$.progreso").value(25))
                .andExpect(jsonPath("$.completado").value(false));
    }

    @Test
    void abonar_abonoQueCompletaMeta_retorna200ConCompletadoTrue() throws Exception {
        when(registrarAbonoUseCase.registrarAbono(eq(1L), any(Money.class)))
                .thenReturn(bolsilloCompleto());

        mockMvc.perform(post("/api/bolsillos/1/abonos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monto\":1000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.acumulado").value(1000))
                .andExpect(jsonPath("$.progreso").value(100))
                .andExpect(jsonPath("$.completado").value(true));
    }

    @Test
    void abonar_montoCero_retorna400PorValidacion() throws Exception {
        mockMvc.perform(post("/api/bolsillos/1/abonos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monto\":0}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void abonar_montoNegativo_retorna400PorValidacion() throws Exception {
        mockMvc.perform(post("/api/bolsillos/1/abonos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monto\":-100}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void abonar_montoInvalidoLanzadoPorCasoDeUso_retorna400() throws Exception {
        when(registrarAbonoUseCase.registrarAbono(eq(1L), any(Money.class)))
                .thenThrow(new MontoInvalidoException("El monto del abono debe ser mayor a cero"));

        mockMvc.perform(post("/api/bolsillos/1/abonos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monto\":250}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void abonar_abonoQueExcedeObjetivo_retorna400() throws Exception {
        when(registrarAbonoUseCase.registrarAbono(eq(1L), any(Money.class)))
                .thenThrow(new MontoExcedeObjetivoException("El abono supera el objetivo del bolsillo 'Vacaciones'"));

        mockMvc.perform(post("/api/bolsillos/1/abonos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monto\":1500}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void abonar_bolsilloNoExiste_retorna404() throws Exception {
        when(registrarAbonoUseCase.registrarAbono(eq(999L), any(Money.class)))
                .thenThrow(new BolsilloNoEncontradoException(999L));

        mockMvc.perform(post("/api/bolsillos/999/abonos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monto\":100}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void archivar_metaCompletada_retorna200ConArchivadoTrue() throws Exception {
        when(archivarBolsilloUseCase.archivar(1L)).thenReturn(bolsilloCompletoArchivado());

        mockMvc.perform(patch("/api/bolsillos/1/archivar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.archivado").value(true))
                .andExpect(jsonPath("$.completado").value(true));
    }

    @Test
    void archivar_metaNoCompletada_retorna400() throws Exception {
        when(archivarBolsilloUseCase.archivar(1L))
                .thenThrow(new MetaNoCompletadaException("Solo se pueden archivar metas completadas"));

        mockMvc.perform(patch("/api/bolsillos/1/archivar"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void restaurar_metaArchivada_retorna200ConArchivadoFalse() throws Exception {
        when(archivarBolsilloUseCase.restaurar(1L)).thenReturn(bolsilloCompleto());

        mockMvc.perform(patch("/api/bolsillos/1/restaurar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.archivado").value(false));
    }

    @Test
    void listarArchivados_conDatos_retornaListaDeArchivadas() throws Exception {
        when(listarBolsillosUseCase.listarArchivados()).thenReturn(List.of(bolsilloCompletoArchivado()));

        mockMvc.perform(get("/api/bolsillos/archivados"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].archivado").value(true))
                .andExpect(jsonPath("$[0].nombre").value("Vacaciones"));
    }
}