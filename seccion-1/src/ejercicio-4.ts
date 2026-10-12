// Subset sum por programación dinámica: cada elemento se usa como máximo una vez.
export function existeSuma(numeros: number[], objetivo: number): boolean {
  if (objetivo === 0) return true;
  let alcanzables = new Set<number>([0]);
  for (const n of numeros) {
    const siguientes = new Set(alcanzables);
    for (const suma of alcanzables) {
      const nueva = suma + n;
      if (nueva === objetivo) return true;
      siguientes.add(nueva);
    }
    alcanzables = siguientes;
  }
  return false;
}
