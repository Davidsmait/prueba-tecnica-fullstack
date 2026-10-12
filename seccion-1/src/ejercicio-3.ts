export type ParPrimo = [number, number];

export function cribaPrimos(limite: number): boolean[] {
  const esPrimo = new Array<boolean>(limite + 1).fill(true);
  esPrimo[0] = false;
  if (limite >= 1) esPrimo[1] = false;
  for (let i = 2; i * i <= limite; i++) {
    if (!esPrimo[i]) continue;
    for (let j = i * i; j <= limite; j += i) esPrimo[j] = false;
  }
  return esPrimo;
}

export function primosGemelos(inicio: number, fin: number): ParPrimo[] {
  if (fin < inicio) return [];
  const esPrimo = cribaPrimos(fin);
  const pares: ParPrimo[] = [];
  for (let p = Math.max(inicio, 2); p + 2 <= fin; p++) {
    if (esPrimo[p] && esPrimo[p + 2]) pares.push([p, p + 2]);
  }
  return pares;
}

export function formatearPares(pares: ParPrimo[]): string {
  if (pares.length === 0) return '0';
  return pares.map(([a, b]) => `(${a}, ${b})`).join(', ');
}
