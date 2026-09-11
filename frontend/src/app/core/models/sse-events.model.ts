import type { Bolsillo } from './bolsillo.model';

export const SSE_EVENTOS = {
  abonoRegistrado: 'abono-registrado',
  metaAlcanzada: 'meta-alcanzada',
} as const;

export type SseEventoNombre = (typeof SSE_EVENTOS)[keyof typeof SSE_EVENTOS];

export interface SseMensaje {
  evento: SseEventoNombre;
  datos: Bolsillo;
}