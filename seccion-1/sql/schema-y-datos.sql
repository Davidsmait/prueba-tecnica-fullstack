CREATE TABLE alumno (
  id        INTEGER PRIMARY KEY,
  nombres   VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  carrera   VARCHAR(100) NOT NULL
);

CREATE TABLE libro (
  id                   INTEGER PRIMARY KEY,
  nombre               VARCHAR(150) NOT NULL,
  editorial            VARCHAR(100) NOT NULL,
  dias_limite_prestamo INTEGER NOT NULL
);

CREATE TABLE prestamo (
  id             INTEGER PRIMARY KEY,
  id_alumno      INTEGER NOT NULL REFERENCES alumno(id),
  id_libro       INTEGER NOT NULL REFERENCES libro(id),
  fecha_prestamo DATE NOT NULL,
  entregado      BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO alumno VALUES
  (1, 'Rosa',  'Torres', 'Sistemas'),
  (2, 'Angel', 'Perez',  'Electronica'),
  (3, 'Sonia', 'Ríos',   'Industrial');

INSERT INTO libro VALUES
  (1, 'Administración',   'Norma',      30),
  (2, 'Redes neuronales', 'Santillana', 30),
  (3, 'Estadistica',      'Regio',      10),
  (4, 'Desarrollo web',   'Limusa',     10);

INSERT INTO prestamo VALUES
  (1,  1, 1, '2021-07-23', FALSE),
  (2,  1, 2, '2021-07-22', FALSE),
  (3,  1, 3, '2021-06-15', FALSE),
  (4,  2, 1, '2021-07-12', FALSE),
  (5,  3, 1, '2021-07-28', TRUE),
  (6,  3, 2, '2021-07-16', TRUE),
  (7,  3, 3, '2021-07-28', TRUE),
  (8,  3, 4, '2021-05-10', FALSE),
  (9,  2, 2, '2021-07-28', FALSE),
  (10, 3, 2, '2021-04-05', FALSE);
