<script setup lang="ts">
import type { Tarea } from '~/types/tarea';

const props = defineProps<{ tarea: Tarea; procesando?: boolean }>();
const emit = defineEmits<{ alternar: [Tarea]; editar: [Tarea]; eliminar: [Tarea] }>();

const fecha = computed(() =>
  new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(props.tarea.fechaCreacion),
  ),
);
</script>

<template>
  <article class="card tarea-card h-100" :class="{ 'tarea-completada': tarea.completado }">
    <div class="card-body">
      <div class="d-flex align-items-center gap-2 mb-2 small">
        <span v-if="tarea.completado" class="badge rounded-pill text-bg-success">
          <i class="bi bi-check-circle-fill me-1" aria-hidden="true" />Completada
        </span>
        <span v-else class="badge rounded-pill text-bg-light border text-secondary">
          <i class="bi bi-circle me-1" aria-hidden="true" />Pendiente
        </span>
        <span class="text-secondary ms-auto"><i class="bi bi-calendar3 me-1" aria-hidden="true" />{{ fecha }}</span>
      </div>

      <h2 class="h6 mb-1 tarea-titulo text-break">{{ tarea.titulo }}</h2>
      <p v-if="tarea.descripcion" class="mb-2 small text-secondary text-break">{{ tarea.descripcion }}</p>

      <a
        v-if="tarea.adjuntoNombre"
        :href="`/api/tareas/${tarea.id}/adjunto`"
        class="adjunto small d-inline-flex align-items-center gap-1 text-truncate mw-100"
      >
        <i class="bi bi-paperclip" aria-hidden="true" />{{ tarea.adjuntoNombre }}
      </a>
    </div>

    <div class="card-footer bg-transparent d-flex align-items-center gap-2">
      <button
        class="btn btn-sm btn-completar"
        :class="tarea.completado ? 'btn-outline-secondary' : 'btn-success'"
        :disabled="procesando"
        :aria-pressed="tarea.completado"
        @click="emit('alternar', tarea)"
      >
        <span v-if="procesando" class="spinner-border spinner-border-sm me-1" aria-hidden="true" />
        <i v-else class="bi me-1" :class="tarea.completado ? 'bi-arrow-counterclockwise' : 'bi-check-lg'" aria-hidden="true" />
        {{ tarea.completado ? 'Reabrir' : 'Completar' }}
      </button>

      <div class="ms-auto d-flex gap-1">
        <button class="btn btn-sm btn-light" title="Editar" @click="emit('editar', tarea)">
          <i class="bi bi-pencil" aria-hidden="true" /><span class="ms-1 d-none d-lg-inline">Editar</span>
          <span class="visually-hidden d-lg-none">Editar</span>
        </button>
        <button class="btn btn-sm btn-light text-danger" title="Eliminar" @click="emit('eliminar', tarea)">
          <i class="bi bi-trash3" aria-hidden="true" /><span class="ms-1 d-none d-lg-inline">Eliminar</span>
          <span class="visually-hidden d-lg-none">Eliminar</span>
        </button>
      </div>
    </div>
  </article>
</template>
