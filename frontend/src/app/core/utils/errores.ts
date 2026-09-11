import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../models/error-response.model';

export function extraerMensajeError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as ErrorResponse | null;
    return body?.message ?? `Error inesperado del servidor (${err.status})`;
  }
  return 'Ocurrió un error inesperado';
}