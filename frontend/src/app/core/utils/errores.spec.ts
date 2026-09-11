import { describe, it, expect } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { extraerMensajeError } from './errores';

describe('extraerMensajeError', () => {
  it('httpErrorResponse_conMensaje_devuelveElMensajeDelBody', () => {
    const err = new HttpErrorResponse({
      error: { message: 'El monto excede el objetivo' },
      status: 400,
      statusText: 'Bad Request',
    });

    expect(extraerMensajeError(err)).toBe('El monto excede el objetivo');
  });

  it('httpErrorResponse_sinMensaje_devuelveMensajeGenericoConStatus', () => {
    const err = new HttpErrorResponse({
      error: null,
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(extraerMensajeError(err)).toBe('Error inesperado del servidor (500)');
  });

  it('httpErrorResponse_conBodyDeTexto_devuelveMensajeGenericoConStatus', () => {
    const err = new HttpErrorResponse({
      error: 'Bad Gateway',
      status: 502,
      statusText: 'Bad Gateway',
    });

    expect(extraerMensajeError(err)).toBe('Error inesperado del servidor (502)');
  });

  it('errorDesconocido_devuelveMensajeGenerico', () => {
    expect(extraerMensajeError(new Error('boom'))).toBe('Ocurrió un error inesperado');
  });
});