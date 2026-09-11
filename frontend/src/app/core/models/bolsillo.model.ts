export interface Bolsillo {
  id: number;
  nombre: string;
  objetivo: number;
  acumulado: number;
  progreso: number;
  completado: boolean;
  archivado: boolean;
}

export interface CrearBolsilloRequest {
  nombre: string;
  objetivo: number;
}

export interface EditarBolsilloRequest {
  nombre: string;
  objetivo: number;
}

export interface AbonoRequest {
  monto: number;
}