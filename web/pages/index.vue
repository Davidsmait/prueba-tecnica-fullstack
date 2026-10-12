<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type { FiltroEstado, Tarea } from '~/types/tarea';

const store = useTareasStore();
const { tareas, total, pagina, totalPaginas, filtro, buscar, cargando, resumen, progreso } = storeToRefs(store);
const alertas = useAlertas();

const { error: errorCarga, refresh } = await useAsyncData('tareas', () => store.cargar().then(() => true));

const modalAbierto = ref(false);
const enEdicion = ref<Tarea | null>(null);
const guardando = ref(false);

const filtros = computed<{ valor: FiltroEstado; etiqueta: string; conteo: number }[]>(() => [
  { valor: 'todas', etiqueta: 'Todas', conteo: resumen.value.total },
  { valor: 'pendientes', etiqueta: 'Pendientes', conteo: resumen.value.pendientes },
  { valor: 'completadas', etiqueta: 'Completadas', conteo: resumen.value.completadas },
]);

const textoVacio = computed(() => {
  if (buscar.value.trim()) return `No hay tareas que coincidan con "${buscar.value.trim()}".`;
  if (filtro.value === 'pendientes') return 'No tienes tareas pendientes. Buen trabajo.';
  if (filtro.value === 'completadas') return 'Todavía no completas ninguna tarea.';
  return 'Aún no tienes tareas.';
});

let temporizador: ReturnType<typeof setTimeout> | undefined;
watch(buscar, () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    pagina.value = 1;
    ejecutar(() => store.cargar());
  }, 350);
});

async function ejecutar(accion: () => Promise<unknown>, exito?: string) {
  try {
    await accion();
    if (exito) await alertas.toast(exito);
  } catch (e) {
    await alertas.error(e);
  }
}

async function alternar(tarea: Tarea) {
  try {
    const completada = await store.alternar(tarea);
    let mensaje = completada ? 'Tarea completada' : 'Tarea reabierta';
    if (filtro.value === 'pendientes' && completada) mensaje += ' · se movió a Completadas';
    if (filtro.value === 'completadas' && !completada) mensaje += ' · se movió a Pendientes';
    await alertas.toastConDeshacer(mensaje, () => ejecutar(() => store.alternar(tarea)));
  } catch (e) {
    await alertas.error(e);
  }
}

function abrirNueva() {
  enEdicion.value = null;
  modalAbierto.value = true;
}

function abrirEdicion(tarea: Tarea) {
  enEdicion.value = tarea;
  modalAbierto.value = true;
}

async function guardar(datos: { titulo: string; descripcion: string; archivo: File | null }) {
  const cuerpo = { titulo: datos.titulo, descripcion: datos.descripcion || undefined };
  const editando = enEdicion.value;
  guardando.value = true;
  await ejecutar(async () => {
    if (editando) await store.actualizar(editando.id, cuerpo, datos.archivo);
    else await store.crear(cuerpo, datos.archivo);
    modalAbierto.value = false;
  }, editando ? 'Tarea actualizada' : 'Tarea creada');
  guardando.value = false;
}

async function eliminar(tarea: Tarea) {
  const ok = await alertas.confirmar('¿Eliminar la tarea?', `"${tarea.titulo}" se borrará junto con su adjunto.`);
  if (ok) await ejecutar(() => store.eliminar(tarea.id), 'Tarea eliminada');
}
</script>

<template>
  <section>
    <header class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-end gap-3 mb-3">
      <div class="flex-grow-1">
        <h1 class="h3 mb-2">Mis tareas</h1>
        <div v-if="resumen.total" class="d-flex align-items-center gap-2 small text-secondary" style="max-width: 22rem">
          <div
            class="progress flex-grow-1"
            role="progressbar"
            :aria-valuenow="progreso"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Progreso"
            style="height: 0.5rem"
          >
            <div class="progress-bar bg-success" :style="{ width: `${progreso}%`, transition: 'width 0.4s ease' }" />
          </div>
          <span class="text-nowrap">{{ resumen.completadas }} de {{ resumen.total }} completadas</span>
        </div>
      </div>
      <button class="btn btn-primary" @click="abrirNueva">
        <i class="bi bi-plus-lg me-1" aria-hidden="true" />Nueva tarea
      </button>
    </header>

    <div class="card mb-4">
      <div class="card-body pb-0">
        <div class="input-group mb-3">
          <span class="input-group-text bg-white"><i class="bi bi-search" aria-hidden="true" /></span>
          <input
            v-model="buscar"
            type="search"
            class="form-control border-start-0"
            placeholder="Buscar por título o descripción"
            aria-label="Buscar tareas"
          />
        </div>

        <div class="d-flex align-items-center gap-3">
          <span class="small text-secondary text-nowrap d-none d-sm-inline" aria-hidden="true">
            <i class="bi bi-funnel me-1" />Mostrar
          </span>
          <ul class="nav nav-underline filtros flex-nowrap flex-grow-1 flex-sm-grow-0" role="tablist" aria-label="Mostrar tareas">
            <li v-for="f in filtros" :key="f.valor" class="nav-item" role="presentation">
              <button
                class="nav-link"
                :class="{ active: filtro === f.valor }"
                role="tab"
                :aria-selected="filtro === f.valor"
                @click="ejecutar(() => store.aplicarFiltro(f.valor))"
              >
                {{ f.etiqueta }}
                <span class="badge rounded-pill" :class="filtro === f.valor ? 'text-bg-dark' : 'text-bg-light border'">
                  {{ f.conteo }}
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <p v-if="buscar.trim() && !errorCarga" class="small text-secondary mb-3">
      {{ total }} resultado{{ total === 1 ? '' : 's' }} para "<strong>{{ buscar.trim() }}</strong>"
      <button class="btn btn-link btn-sm p-0 ms-2 align-baseline" @click="buscar = ''">Limpiar búsqueda</button>
    </p>

    <div v-if="errorCarga" class="alert alert-danger d-flex justify-content-between align-items-center">
      No se pudo conectar con la API.
      <button class="btn btn-sm btn-outline-danger" @click="refresh()">Reintentar</button>
    </div>

    <div v-else-if="cargando && !tareas.length" class="text-center py-5">
      <div class="spinner-border" role="status"><span class="visually-hidden">Cargando</span></div>
    </div>

    <div v-else-if="!tareas.length" class="text-center text-secondary py-5">
      <i class="bi bi-clipboard-check display-6 d-block mb-2" aria-hidden="true" />
      <p class="mb-2">{{ textoVacio }}</p>
      <button v-if="filtro === 'todas' && !buscar" class="btn btn-outline-primary btn-sm" @click="abrirNueva">
        Crea tu primera tarea
      </button>
    </div>

    <TransitionGroup
      v-else
      tag="div"
      name="lista"
      class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3 mb-4"
      :class="{ 'opacity-50': cargando }"
    >
      <div v-for="tarea in tareas" :key="tarea.id" class="col">
        <TareaItem
          :tarea="tarea"
          :procesando="store.estaProcesando(tarea.id)"
          @alternar="alternar"
          @editar="abrirEdicion"
          @eliminar="eliminar"
        />
      </div>
    </TransitionGroup>

    <Paginacion :pagina="pagina" :total-paginas="totalPaginas" @cambiar="(n) => ejecutar(() => store.irAPagina(n))" />

    <TareaModal v-if="modalAbierto" :tarea="enEdicion" :guardando="guardando" @cerrar="modalAbierto = false" @guardar="guardar" />
  </section>
</template>
