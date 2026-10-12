# Sección 1 · Ejercicios lógico-matemáticos

TypeScript, sin dependencias en tiempo de ejecución. Tests con Vitest.

```bash
npm ci
npm test
npm run demo
```

| Ejercicio | Archivo | Enfoque | Complejidad |
|---|---|---|---|
| 1. Invertir palabras | `src/ejercicio-1.ts` | `split(' ')` y se invierte cada palabra con `Array.from`, para no romper caracteres Unicode | O(n) |
| 2. Pares únicos | `src/ejercicio-2.ts` | `Set` conserva el orden de inserción y descarta repetidos | O(n) |
| 3. Primos gemelos | `src/ejercicio-3.ts` | Criba de Eratóstenes hasta `fin` y recorrido buscando `p` y `p + 2` | O(n log log n) |
| 4. Suma objetivo | `src/ejercicio-4.ts` | Programación dinámica: conjunto de sumas alcanzables, cada elemento una vez | O(n · S) |
| 5. SQL | `sql/ejercicio-5.sql` | Ver abajo | — |

## Ejercicio 5 · SQL (PostgreSQL)

`sql/schema-y-datos.sql` crea las tablas con los datos del enunciado. Las fechas se pasaron a formato ISO.

```sql
SELECT
  l.nombre                                    AS libro,
  p.fecha_prestamo,
  p.fecha_prestamo + l.dias_limite_prestamo   AS fecha_vencimiento,
  DATE '2021-07-30' - (p.fecha_prestamo + l.dias_limite_prestamo) AS dias_de_atraso
FROM prestamo p
JOIN alumno a ON a.id = p.id_alumno
JOIN libro  l ON l.id = p.id_libro
WHERE a.nombres = 'Sonia'
  AND p.entregado = FALSE
  AND p.fecha_prestamo + l.dias_limite_prestamo < DATE '2021-07-30'
ORDER BY p.fecha_prestamo;
```

Resultado verificado en PostgreSQL 16:

| libro | fecha_prestamo | fecha_vencimiento | dias_de_atraso |
|---|---|---|---|
| Redes neuronales | 2021-04-05 | 2021-05-05 | 86 |
| Desarrollo web | 2021-05-10 | 2021-05-20 | 71 |

Los préstamos 5, 6 y 7 de Sonia ya se entregaron, por eso no aparecen. En un sistema real filtraría por `a.id` y no por nombre, para no mezclar alumnos homónimos; aquí se usa el nombre porque así lo plantea el enunciado.
