export function invertirPalabras(texto: string): string {
  return texto
    .split(' ')
    .map((palabra) => Array.from(palabra).reverse().join(''))
    .join(' ');
}
