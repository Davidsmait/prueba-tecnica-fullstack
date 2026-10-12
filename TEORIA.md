# Sección 3 · Preguntas teóricas

## 1. Express vs NestJS

**Express** es un framework minimalista: da el enrutamiento y la cadena de middlewares, y todo lo demás (estructura de carpetas, validación, inyección de dependencias, testing) lo decide el equipo. **NestJS** corre encima de Express (o Fastify) y agrega una arquitectura opinada inspirada en Angular: módulos, controladores y providers, inyección de dependencias, decoradores, y piezas estándar para el ciclo de la petición (pipes para validar, guards para autorizar, interceptors y exception filters).

Usaría **Express** para servicios pequeños o muy acotados: un webhook, un microservicio de una sola responsabilidad, un prototipo, o cuando el rendimiento y el tamaño importan más que la estructura. Usaría **NestJS** en aplicaciones medianas o grandes, con varios desarrolladores, muchos dominios o vida larga, porque la convención reduce las decisiones repetidas y hace el código predecible y fácil de probar (los providers se sustituyen por mocks con la DI). Es lo que uso en el trabajo para un backend multi-tenant: los módulos por dominio y los guards compartidos evitan que cada endpoint resuelva la autenticación y el tenant a su manera.

## 2. SQL vs NoSQL

Un motor **relacional** (PostgreSQL) guarda datos en tablas con un esquema definido, relaciona entidades con llaves foráneas y joins, y garantiza transacciones ACID. Escala principalmente en vertical, aunque también admite réplicas de lectura y particionamiento. Un motor **no relacional** de documentos (MongoDB) guarda documentos JSON/BSON con esquema flexible, favorece embeber los datos que se leen juntos, y está pensado para escalar en horizontal con sharding. Históricamente ha relajado la consistencia y las transacciones entre documentos, aunque hoy ya las soporta.

Para una app de tareas a gran escala tomaría en cuenta:

- **Forma de los datos y relaciones:** tareas, usuarios, equipos, permisos y etiquetas son muy relacionales y se consultan cruzados, lo que favorece SQL.
- **Consistencia:** asignaciones, permisos y conteos piden transacciones confiables.
- **Patrones de consulta:** filtros, ordenamiento, paginación y reportes, que SQL resuelve bien con índices compuestos.
- **Volumen y escritura:** si el cuello de botella fuera un volumen enorme de escrituras con esquema cambiante (por ejemplo, un historial de actividad), un documental o una tabla particionada para esa parte.
- **Equipo y operación:** experiencia del equipo, herramientas y costo de operar el motor.

Para este caso elegí **PostgreSQL**: es relacional por naturaleza, y con índices, particionamiento y réplicas de lectura escala bastante antes de necesitar otra cosa.

## 3. Middleware de autenticación y JWT

**Ciclo de una petición:** el cliente envía la petición HTTP. El servidor la pasa por la cadena de middlewares en orden; cada uno puede leer o modificar la petición, responder él mismo y cortar la cadena, o llamar a `next()`. El middleware de autenticación lee la credencial (por ejemplo, el header `Authorization`) y la valida. Si no es válida responde **401** y la petición nunca llega al controlador. Si es válida, puede adjuntar la identidad a la petición (`req.user`) y llamar a `next()`. Después siguen, en Nest, los guards (autorización), pipes (validación) y el controlador, y la respuesta regresa por los interceptors.

**Flujo JWT:**

1. El usuario se autentica (por ejemplo, con correo y contraseña).
2. El servidor genera un token firmado (HS256 con un secreto, o RS256 con llave privada). El token lleva claims como `sub`, roles y `exp`.
3. El cliente lo envía en cada petición: `Authorization: Bearer <token>`.
4. El middleware o guard verifica la firma y la expiración, sin consultar la base de datos, y extrae la identidad.
5. Al expirar, se renueva con un refresh token de vida más larga, que sí se valida contra el servidor y se puede revocar.

**Por qué se prefiere en REST:** es **stateless**, igual que REST. El servidor no guarda sesiones, cualquier instancia puede validar el token, y eso facilita escalar en horizontal y repartir carga. Además es un estándar que funciona igual en web, móvil y entre servicios. Lo que hay que cuidar es que el payload se puede leer (está firmado, no cifrado), así que no se ponen datos sensibles. También conviene usar expiraciones cortas, porque un token emitido no se revoca sin un mecanismo extra.

En esta prueba usé un token fijo porque así lo pide el enunciado. No viaja al navegador: el servidor de Nuxt lo agrega al reenviar cada petición.

## 4. Pinia vs props y eventos

Pasar props hacia abajo y emitir eventos hacia arriba funciona bien entre padre e hijo. Cuando varios componentes alejados en el árbol necesitan el mismo dato, aparecen estos problemas:

- **Prop drilling:** componentes intermedios reciben y reenvían props que no usan, solo para que lleguen más abajo.
- **Cadenas de eventos:** para que un cambio suba, hay que reemitirlo nivel por nivel. Es frágil y difícil de rastrear.
- **Estado duplicado o desincronizado:** cada rama guarda su copia y terminan mostrando cosas distintas.
- **Acoplamiento a la estructura:** mover un componente de lugar obliga a recablear props y eventos.

**Pinia** centraliza el estado en stores: una sola fuente de verdad, con `state`, `getters` y `actions`, a la que cualquier componente accede directamente y de forma reactiva. La lógica de negocio sale de los componentes y queda en las actions, que se prueban aisladas. Con TypeScript está tipado de extremo a extremo, se inspecciona en Vue Devtools y en Nuxt se integra con SSR: el estado que se carga en el servidor se serializa y se hidrata en el cliente. En este proyecto el store de tareas concentra la lista, la paginación y los filtros, y los componentes solo leen y disparan acciones.

## 5. SPA vs SSR (Nuxt 3)

- **SPA (Single Page Application):** el servidor manda un HTML casi vacío y el bundle de JavaScript. El navegador descarga, ejecuta y pide los datos, y entonces pinta. Después navega sin recargar la página.
- **SSR (Server-Side Rendering):** el servidor ejecuta la app en cada petición y manda el HTML ya renderizado con los datos. En el cliente, Vue "hidrata" ese HTML (le conecta la reactividad y los eventos) y a partir de ahí se comporta como SPA. Nuxt 3 lo hace por defecto y permite mezclar estrategias por ruta (`routeRules`: SSR, prerender, ISR o solo cliente).

**Ventajas de SSR con Nuxt 3:**

- **SEO:** los buscadores y los previews de redes sociales reciben el contenido y las meta etiquetas en el HTML, sin depender de que ejecuten JavaScript.
- **First Contentful Paint más rápido:** el usuario ve contenido real en cuanto llega el HTML, sin esperar a que se descargue y ejecute el bundle ni a que terminen las peticiones de datos. Se nota sobre todo en móviles y redes lentas.
- **Datos en el servidor:** las llamadas a la API ocurren cerca del backend y pueden usar secretos que nunca llegan al cliente (aquí, el token).

**Desventajas:**

- **Más carga y costo en el servidor:** se renderiza en cada petición, así que hace falta un servidor Node (o funciones), no solo hosting estático, y planear caché.
- **TTFB puede subir:** el servidor espera los datos antes de responder.
- **Hidratación:** hasta que termina, la página se ve lista pero todavía no responde. Si el HTML del servidor y el del cliente no coinciden aparecen *hydration mismatches*.
- **Complejidad:** el código corre en dos entornos, así que no se puede usar `window` ni `localStorage` en el servidor, y las librerías solo de navegador se cargan del lado del cliente. Por eso SweetAlert2 se importa de forma dinámica en este proyecto.

Para una lista de tareas privada detrás de login, el SEO no importa tanto. Aun así elegí SSR para que la primera pintura ya traiga las tareas y para mantener el token en el servidor.
