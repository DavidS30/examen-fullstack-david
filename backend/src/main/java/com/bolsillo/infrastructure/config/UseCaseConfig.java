package com.bolsillo.infrastructure.config;

import com.bolsillo.application.ports.BolsilloRepository;
import com.bolsillo.application.ports.NotificadorPort;
import com.bolsillo.application.usecase.ArchivarBolsilloUseCase;
import com.bolsillo.application.usecase.CrearBolsilloUseCase;
import com.bolsillo.application.usecase.ListarBolsillosUseCase;
import com.bolsillo.application.usecase.RegistrarAbonoUseCase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registra los casos de uso como beans Spring. La capa application permanece
 * 100% agnóstica de Spring (sin anotaciones).
 */
@Configuration
public class UseCaseConfig {

    @Bean
    public CrearBolsilloUseCase crearBolsilloUseCase(BolsilloRepository repository) {
        return new CrearBolsilloUseCase(repository);
    }

    @Bean
    public RegistrarAbonoUseCase registrarAbonoUseCase(
            BolsilloRepository repository,
            NotificadorPort notificador
    ) {
        return new RegistrarAbonoUseCase(repository, notificador);
    }

    @Bean
    public ListarBolsillosUseCase listarBolsillosUseCase(BolsilloRepository repository) {
        return new ListarBolsillosUseCase(repository);
    }

    @Bean
    public ArchivarBolsilloUseCase archivarBolsilloUseCase(BolsilloRepository repository) {
        return new ArchivarBolsilloUseCase(repository);
    }
}