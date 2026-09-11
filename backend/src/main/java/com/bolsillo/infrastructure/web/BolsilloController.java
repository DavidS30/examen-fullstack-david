package com.bolsillo.infrastructure.web;

import com.bolsillo.application.usecase.CrearBolsilloUseCase;
import com.bolsillo.application.usecase.ListarBolsillosUseCase;
import com.bolsillo.application.usecase.RegistrarAbonoUseCase;
import com.bolsillo.domain.bolsillo.Bolsillo;
import com.bolsillo.domain.money.Money;
import com.bolsillo.infrastructure.web.dto.AbonoRequest;
import com.bolsillo.infrastructure.web.dto.BolsilloResponse;
import com.bolsillo.infrastructure.web.dto.CrearBolsilloRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bolsillos")
public class BolsilloController {

    private final CrearBolsilloUseCase crearBolsilloUseCase;
    private final ListarBolsillosUseCase listarBolsillosUseCase;
    private final RegistrarAbonoUseCase registrarAbonoUseCase;

    public BolsilloController(
            CrearBolsilloUseCase crearBolsilloUseCase,
            ListarBolsillosUseCase listarBolsillosUseCase,
            RegistrarAbonoUseCase registrarAbonoUseCase
    ) {
        this.crearBolsilloUseCase = crearBolsilloUseCase;
        this.listarBolsillosUseCase = listarBolsillosUseCase;
        this.registrarAbonoUseCase = registrarAbonoUseCase;
    }

    @GetMapping
    public List<BolsilloResponse> listar() {
        return listarBolsillosUseCase.listar().stream()
                .map(BolsilloResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BolsilloResponse crear(@Valid @RequestBody CrearBolsilloRequest request) {
        Bolsillo bolsillo = crearBolsilloUseCase.crear(request.nombre(), new Money(request.objetivo()));
        return BolsilloResponse.from(bolsillo);
    }

    @PostMapping("/{id}/abonos")
    public BolsilloResponse abonar(@PathVariable Long id, @Valid @RequestBody AbonoRequest request) {
        Bolsillo bolsillo = registrarAbonoUseCase.registrarAbono(id, new Money(request.monto()));
        return BolsilloResponse.from(bolsillo);
    }
}