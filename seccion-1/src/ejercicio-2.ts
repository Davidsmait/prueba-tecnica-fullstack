export function paresUnicos(numeros: number[]): number[] {
  const vistos = new Set<number>();
  for (const n of numeros) {
    if (n % 2 === 0) vistos.add(n);
  }
  return [...vistos];
}
