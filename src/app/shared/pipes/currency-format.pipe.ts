import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ 
  name: 'moneda',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, symbol = '$'): string {
    if (value == null) return '';
    return `${symbol}${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
