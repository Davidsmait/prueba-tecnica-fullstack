-- Libros que Sonia tiene prestados, sin devolver y vencidos al 30/07/2021.
-- Vencido: la fecha de préstamo más los días límite del libro ya pasó a la fecha de corte.
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
