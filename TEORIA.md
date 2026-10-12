# Sección 3 · Preguntas teóricas

## 1. Express vs NestJS

Express es la base: te da el enrutamiento y la forma de levantar un servidor en Node, y casi todo lo demás lo tienes que armar tú. NestJS corre encima de Express pero ya trae el paquete completo: módulos, inyección de dependencias, guards para autenticación, pipes para validar y una estructura definida de controllers y services.

En el trabajo usamos NestJS en un backend grande y se nota la diferencia: todos sabemos dónde va cada cosa, la autenticación vive en un guard y no se repite en cada ruta, y gracias a la inyección de dependencias es fácil probar un service sustituyendo lo que usa. Además, viniendo de Angular, los decoradores y los módulos se sienten muy familiares.

Usaría Express para probar una idea o hacer un ejercicio rápido, donde la estructura de Nest sería más de lo que hace falta. Para un proyecto que va a crecer o donde trabaja un equipo, me quedo con NestJS.

## 2. SQL vs NoSQL

La diferencia principal es que una base relacional como PostgreSQL pone reglas: tablas con columnas definidas, relaciones entre ellas (una venta tiene que apuntar a un producto que exista) y transacciones, que hacen que si algo falla a la mitad se deshaga todo. Una base NoSQL como MongoDB guarda documentos tipo JSON sin un esquema obligatorio: es más flexible, pero las reglas las tienes que cuidar tú en el código.

Lo he vivido de los dos lados. Mi punto de venta está en PostgreSQL porque maneja ventas, productos y clientes que se cruzan todo el tiempo, y con dinero de por medio necesito que todo cuadre. Mongo lo he usado poco, en un chat interno y en algunas pruebas; con Firebase me tocó algo parecido, y lo que menos me gustó fue justo eso: que no había restricciones.

Para una app de tareas a gran escala tomaría en cuenta qué tan relacionados están los datos (tareas, usuarios, equipos, permisos), si necesito consistencia, y qué consultas voy a hacer (filtros, paginación, reportes). Por eso elegí PostgreSQL. Mongo lo usaría para partes donde cada registro vive casi solo y su forma cambia, como los mensajes de un chat o un historial de actividad.

## 3. Middleware de autenticación y JWT

Cuando llega una petición, pasa por los middlewares en orden antes de llegar al controller. El middleware de autenticación revisa el header (por ejemplo, Authorization), y si el token no es válido responde 401 y la petición nunca llega al controller. Si es válido, la deja pasar con next(). En esta prueba así funciona: el middleware revisa el token fijo antes de cualquier ruta de /tareas.

El flujo con JWT, como lo uso en mi punto de venta con Supabase Auth:

1. El usuario inicia sesión y el backend le regresa un token JWT firmado.
2. El front guarda ese token y lo manda en cada petición en el header Authorization: Bearer <token>.
3. El backend verifica la firma y la fecha de expiración, y con eso sabe quién es el usuario.

Se prefiere en APIs REST porque el servidor no tiene que guardar sesiones: el token trae la información y solo se verifica. Funciona igual en web y en móvil (lo he usado así en apps con Ionic), y expira solo, porque la fecha de vencimiento viene dentro del token.

En esta prueba el token es fijo porque así lo pedía el enunciado, pero no lo expuse en el navegador: el servidor de Nuxt lo agrega al reenviar cada petición a la API.

## 4. Pinia vs props y eventos

Pasar props de padre a hijo y emitir eventos hacia arriba funciona bien entre dos niveles. El problema empieza cuando varios componentes lejanos necesitan el mismo dato: terminas pasando props por componentes que ni los usan, reemitiendo eventos nivel por nivel, y cada parte puede quedarse con una copia distinta del dato.

Pinia resuelve eso con un store central: una sola fuente de verdad que cualquier componente puede leer o modificar directamente, y todos se actualizan solos porque es reactivo. La lógica también sale de los componentes y queda en las acciones del store.

En Angular resuelvo lo mismo con services y BehaviorSubject, con signals o con NgRx según el proyecto, así que Pinia me resultó la misma idea aplicada a Vue. En esta prueba el store de tareas guarda la lista, la paginación, los filtros y los contadores, y los componentes solo leen y llaman acciones.

## 5. SPA vs SSR (Nuxt 3)

En una SPA el servidor manda un HTML casi vacío y el navegador tiene que descargar y ejecutar el JavaScript para pintar la página y pedir los datos. Con SSR el servidor arma la página con los datos y manda el HTML listo; después Vue "hidrata" esa página en el navegador y sigue funcionando como una SPA.

Ventajas de SSR con Nuxt 3:

- SEO: los buscadores reciben el contenido ya en el HTML. Para mi blog investigué opciones y elegí Astro justo por eso, porque para contenido y SEO funciona mejor que una SPA.
- First Contentful Paint más rápido: el usuario ve contenido en cuanto llega el HTML, sin esperar a que cargue todo el JavaScript.

Desventajas:

- El código corre en el servidor y en el navegador, y en el servidor no existen window ni localStorage. En esta prueba me pasó con SweetAlert2: lo cargué de forma dinámica para que solo se use en el navegador.
- Necesitas un servidor corriendo (no basta un hosting estático), lo que significa más costo y más cosas que mantener.

Para esta app de tareas el SEO no es tan importante, pero usé SSR para que la lista llegue ya cargada y para mantener el token en el servidor.
