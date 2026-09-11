import { Pipe, PipeTransform } from '@angular/core';

const FORMATO_COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

@Pipe({ name: 'pesos', standalone: true })
export class PesosPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '';
    }
    return FORMATO_COP.format(value).replace(/\u00A0/g, ' ');
  }
}