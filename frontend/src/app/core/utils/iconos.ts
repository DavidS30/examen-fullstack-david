const ICONOS_META = ['🪙', '🐷', '🌴', '✈️', '🏠', '💻', '🎓', '🚗', '💍', '🎁', '🏖️', '📱'];

export const ACENTOS_META = ['#0d9488', '#f59e0b', '#8b5cf6', '#f43f5e', '#3b82f6', '#84cc16'];

interface MapeoIcono {
  icono: string;
  palabras: readonly string[];
}

const MAPEO_ICONOS: readonly MapeoIcono[] = [
  { icono: '✈️', palabras: ['viaj', 'vacac', 'vuel', 'avion', 'turism', 'caribe', 'cartagena'] },
  { icono: '🏠', palabras: ['cas', 'hogar', 'apartam', 'remodel', 'mueble', 'cuota inicial'] },
  { icono: '🚗', palabras: ['carr', 'auto', 'moto', 'vehicul', 'coche'] },
  { icono: '💻', palabras: ['comput', 'laptop', 'portatil', 'notebook', ' pc', ' mac', 'gamer'] },
  { icono: '🎓', palabras: ['estudi', 'universid', 'colegi', 'maestri', 'curso', 'educac', 'libro'] },
  { icono: '💍', palabras: ['boda', 'anill', 'matrimon', 'compromis', 'novi'] },
  { icono: '🎁', palabras: ['regal', 'navidad', 'cumplea', 'sorpresa', 'fiesta'] },
  { icono: '🏖️', palabras: ['playa', 'verano', 'piscina', 'tropical', 'sol'] },
  { icono: '📱', palabras: ['celular', 'telefono', 'iphone', 'samsung', 'movil', 'smartph'] },
  { icono: '🪙', palabras: ['ahorr', 'emergencia', 'fondo', 'inversion', 'meta'] },
  { icono: '🐷', palabras: ['cerdit', 'alcancia', 'chanchit'] },
];

/**
 * Hash determinista simple sobre un nombre (suma de códigos Unicode).
 * El mismo texto siempre produce el mismo número; útil para derivar
 * iconos/colores estables por meta.
 */
export function hashNombre(nombre: string): number {
  return [...nombre].reduce((total, letra) => total + letra.charCodeAt(0), 0);
}

/**
 * Acento de color estable derivado del nombre (mismo hash que los iconos).
 */
export function acentoPorNombre(nombre: string): string {
  return ACENTOS_META[hashNombre(nombre) % ACENTOS_META.length];
}

/**
 * Mapea un nombre a un icono de forma semántica: si el nombre menciona un
 * tema (viaje, casa, carro...) se usa ese icono; si no, un icono del
 * catálogo mediante hash (estable y variado).
 */
export function iconoPorNombre(nombre: string): string {
  const normalizado = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const coincidencia = MAPEO_ICONOS.find((mapeo) =>
    mapeo.palabras.some((palabra) => normalizado.includes(palabra))
  );
  if (coincidencia) {
    return coincidencia.icono;
  }
  return ICONOS_META[hashNombre(normalizado) % ICONOS_META.length];
}