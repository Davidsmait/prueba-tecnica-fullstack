import { invertirPalabras } from "./ejercicio-1";
import { paresUnicos } from "./ejercicio-2";
import { primosGemelos, formatearPares } from "./ejercicio-3";
import { existeSuma } from "./ejercicio-4";

console.log("Ejercicio 1");
for (const t of ["Hola soy una cadena"]) {
  console.log(`  "${t}" -> "${invertirPalabras(t)}"`);
}

console.log("Ejercicio 2");
for (const a of [
  [2, 7, 9, 12, 33, 15, 22, 12, 4],
  [1, 2, 3, 4, 5, 6, 7, 2, 4, 6, 8, 6],
]) {
  console.log(`  [${a}] -> [${paresUnicos(a)}]`);
}

console.log("Ejercicio 3");
for (const [i, f] of [
  [0, 10],
  [100, 150],
  [700, 800],
]) {
  console.log(`  ${i},${f} -> ${formatearPares(primosGemelos(i, f))}`);
}

console.log("Ejercicio 4");
const casos: [number[], number][] = [
  [[2, 5, 8, 44, 1, 7], 9],
  [[55, 3, 8, 11, 45, 1], 12],
  [[4, 8, 48, 44, 1], 11],
];
for (const [a, o] of casos) {
  console.log(`  [${a}], ${o} -> ${existeSuma(a, o) ? "TRUE" : "FALSE"}`);
}
