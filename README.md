# Prueba técnica · Desarrollo Full Stack

**Repositorio:** monorepo con las tres secciones de la prueba.

| Carpeta | Contenido |
|---|---|
| [`seccion-1/`](seccion-1/) | Ejercicios lógico-matemáticos en TypeScript con tests (Vitest) y consulta SQL (ejercicio 5) |
| [`api/`](api/) | Mini API de Tareas: NestJS + PostgreSQL + Prisma, auth por token, adjuntos en FileSystem, Swagger |
| [`web/`](web/) | App de Lista de Tareas: Nuxt 3 (SSR) + Pinia + Bootstrap + Vuelidate + SweetAlert2 |
| [`TEORIA.md`](TEORIA.md) | Sección 3: respuestas teóricas |

## Levantar todo con un comando

Requisitos: Docker y Docker Compose.

```bash
docker compose up --build
```

- App: http://localhost:3000
- API: http://localhost:3001 (Swagger en http://localhost:3001/docs)
- Token por defecto: `cambia-este-token` (se cambia con la variable `API_TOKEN`)

La API aplica las migraciones de Prisma al arrancar.

## Correr cada parte sin Docker

**Sección 1**

```bash
cd seccion-1 && npm ci
npm test        # 16 casos, incluidos todos los ejemplos del enunciado
npm run demo    # imprime las salidas de los ejemplos
```

**API** (necesita un PostgreSQL local)

```bash
cd api && npm ci
cp .env.example .env            # ajustar DATABASE_URL
npx prisma migrate deploy
npm run build && npm start
npm test                        # unit
npm run test:e2e                # e2e contra la BD de DATABASE_URL (la limpia: usar una BD de pruebas)
```

**Web**

```bash
cd web && npm ci
cp .env.example .env            # NUXT_API_BASE y NUXT_API_TOKEN
npm run dev
```

## Endpoints

Todas las rutas de `/tareas` requieren `Authorization: Bearer <token>` (o `x-api-token: <token>`).

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/tareas?pagina=1&limite=10&completado=true&buscar=texto` | Lista paginada con filtros |
| GET | `/tareas/resumen` | Conteo total, completadas y pendientes |
| GET | `/tareas/:id` | Detalle |
| POST | `/tareas` | Crear `{ titulo, descripcion?, completado? }` |
| PATCH | `/tareas/:id` | Actualizar parcial |
| DELETE | `/tareas/:id` | Eliminar (borra también el adjunto) |
| POST | `/tareas/:id/adjunto` | Subir adjunto (`multipart/form-data`, campo `archivo`, máx. 5 MB, PDF/imagen/texto) |
| GET | `/tareas/:id/adjunto` | Descargar adjunto |
| GET | `/health` | Público |

Cada tarea tiene `id`, `titulo`, `descripcion`, `completado`, `fechaCreacion` y los metadatos del adjunto.

## Decisiones técnicas

- **Prisma en lugar de TypeORM.** El enunciado permite tecnologías equivalentes con justificación: Prisma es el ORM que uso en producción, da tipado de extremo a extremo generado desde el esquema y migraciones declarativas versionadas (`api/prisma/migrations`).
- **Middleware de autenticación con token fijo.** Implementado como `NestMiddleware` aplicado solo al controlador de tareas; acepta `Authorization: Bearer` o `x-api-token` y compara en tiempo constante. En producción lo cambiaría por JWT (ver `TEORIA.md`, pregunta 3).
- **El token nunca llega al navegador.** El front llama a `/api/*` en el servidor de Nuxt (patrón BFF), que reenvía la petición a la API agregando el token desde `runtimeConfig`. Si el navegador llamara directo a la API, el token quedaría expuesto en el bundle.
- **SSR.** La lista se renderiza en el servidor (`useAsyncData` + store de Pinia hidratado), así la primera pintura ya trae datos.
- **Validación en ambos lados.** `class-validator` con `whitelist` y `forbidNonWhitelisted` en la API; Vuelidate en el formulario (título obligatorio, longitudes, tamaño de archivo).
- **Adjuntos en FileSystem.** Multer con nombres UUID (evita colisiones y path traversal), lista blanca de tipos MIME y límite de 5 MB. Al reemplazar o borrar una tarea se elimina el archivo anterior. No hice el despliegue opcional en AWS.
- **Paginación en servidor** con `skip/take` y `count` en una sola transacción; el límite máximo por página es 50.
- **UX de completar y filtrar.** Completar es un botón con texto ("Completar" / "Reabrir") en lugar de un checkbox. Al hacerlo la tarjeta cambia de estado de forma visible y aparece un aviso con "Deshacer", siguiendo el principio de visibilidad del estado del sistema de Nielsen Norman Group. Los filtros son pestañas con etiqueta y contador por estado (`GET /tareas/resumen`), y una barra de progreso muestra cuántas tareas se han completado.
- **Composables y layout reutilizable:** `useAlertas` (SweetAlert2), `useTareaFormulario` (Vuelidate) y `layouts/default.vue`. Responsive con la grilla de Bootstrap; el formulario es pantalla completa en móvil.

## Supuestos de la Sección 1

- **Ejercicio 2:** se conserva el orden de primera aparición, como en los ejemplos.
- **Ejercicio 3:** si no hay pares se devuelve una lista vacía y se imprime `0`. Un par cuenta solo si ambos primos están dentro del rango.
- **Ejercicio 4:** cualquier subconjunto, de cualquier tamaño, donde cada elemento se usa como máximo una vez. Se resuelve con programación dinámica sobre las sumas alcanzables.
- **Ejercicio 5:** un préstamo está vencido si `fecha_prestamo + dias_limite_prestamo < 2021-07-30` y no se ha entregado. Detalle y resultado en [`seccion-1/README.md`](seccion-1/README.md).

## Declaración de uso de IA

Usé **Claude (Anthropic)** como asistente durante la prueba:

- **Lo que hizo la IA:** generó la mayor parte del código a partir de mis indicaciones, los tests y un primer borrador de las respuestas teóricas.
- **Lo que hice yo:** definí el stack y el alcance (NestJS + Prisma por mi experiencia en producción, BFF para no exponer el token, qué extras incluir y cuáles no), revisé y ajusté el código y las respuestas, y verifiqué que todo corra: tests en verde, flujo completo en navegador (escritorio y móvil) y `docker compose up`.

Puedo explicar y modificar cualquier parte del código.
