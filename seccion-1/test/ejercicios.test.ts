import { describe, expect, it } from 'vitest';
import { invertirPalabras } from '../src/ejercicio-1';
import { paresUnicos } from '../src/ejercicio-2';
import { formatearPares, primosGemelos } from '../src/ejercicio-3';
import { existeSuma } from '../src/ejercicio-4';

describe('Ejercicio 1 · invertirPalabras', () => {
  it.each([
    ['Hola soy una cadena', 'aloH yos anu anedac'],
    ['Programando ando', 'odnamargorP odna'],
    ['Concatenación', 'nóicanetacnoC'],
    ['', ''],
  ])('%s', (entrada, salida) => {
    expect(invertirPalabras(entrada)).toBe(salida);
  });
});

describe('Ejercicio 2 · paresUnicos', () => {
  it('caso 1', () => expect(paresUnicos([2, 7, 9, 12, 33, 15, 22, 12, 4])).toEqual([2, 12, 22, 4]));
  it('caso 2', () => expect(paresUnicos([1, 2, 3, 4, 5, 6, 7, 2, 4, 6, 8, 6])).toEqual([2, 4, 6, 8]));
  it('sin pares', () => expect(paresUnicos([1, 3, 5])).toEqual([]));
  it('negativos y cero', () => expect(paresUnicos([0, -2, -2, 3])).toEqual([0, -2]));
});

describe('Ejercicio 3 · primosGemelos', () => {
  it('0,10', () => expect(formatearPares(primosGemelos(0, 10))).toBe('(3, 5), (5, 7)'));
  it('100,150 (149,151 queda fuera)', () =>
    expect(formatearPares(primosGemelos(100, 150))).toBe('(101, 103), (107, 109), (137, 139)'));
  it('700,800', () => expect(formatearPares(primosGemelos(700, 800))).toBe('0'));
  it('rango invertido', () => expect(primosGemelos(10, 0)).toEqual([]));
});

describe('Ejercicio 4 · existeSuma', () => {
  it('8+1 o 2+7', () => expect(existeSuma([2, 5, 8, 44, 1, 7], 9)).toBe(true));
  it('3+8+1', () => expect(existeSuma([55, 3, 8, 11, 45, 1], 12)).toBe(true));
  it('sin combinación', () => expect(existeSuma([4, 8, 48, 44, 1], 11)).toBe(false));
  it('no reutiliza elementos', () => expect(existeSuma([5], 10)).toBe(false));
});
