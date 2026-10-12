<script setup lang="ts">
import type { Tarea } from '~/types/tarea';

const props = defineProps<{ tarea: Tarea | null; guardando?: boolean }>();
const emit = defineEmits<{ cerrar: []; guardar: [{ titulo: string; descripcion: string; archivo: File | null }] }>();

const { form, v$, error } = useTareaFormulario(props.tarea);
const esEdicion = computed(() => props.tarea !== null);

function alElegirArchivo(e: Event) {
  form.archivo = (e.target as HTMLInputElement).files?.[0] ?? null;
  v$.value.archivo.$touch();
}

async function enviar() {
  if (!(await v$.value.$validate())) return;
  emit('guardar', { titulo: form.titulo.trim(), descripcion: form.descripcion.trim(), archivo: form.archivo });
}
</script>

<template>
  <div class="modal d-block modal-abierto" tabindex="-1" role="dialog" aria-modal="true" @click.self="emit('cerrar')">
    <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
      <form class="modal-content" novalidate @submit.prevent="enviar">
        <div class="modal-header">
          <h2 class="modal-title h5">{{ esEdicion ? 'Editar tarea' : 'Nueva tarea' }}</h2>
          <button type="button" class="btn-close" aria-label="Cerrar" @click="emit('cerrar')" />
        </div>

        <div class="modal-body">
          <div class="mb-3">
            <label for="titulo" class="form-label">Título</label>
            <input
              id="titulo"
              v-model="form.titulo"
              class="form-control"
              :class="{ 'is-invalid': v$.titulo.$error }"
              maxlength="120"
              autofocus
              @blur="v$.titulo.$touch()"
            />
            <div class="invalid-feedback">{{ error('titulo') }}</div>
          </div>

          <div class="mb-3">
            <label for="descripcion" class="form-label">Descripción <span class="text-secondary">(opcional)</span></label>
            <textarea
              id="descripcion"
              v-model="form.descripcion"
              class="form-control"
              :class="{ 'is-invalid': v$.descripcion.$error }"
              rows="3"
              @blur="v$.descripcion.$touch()"
            />
            <div class="invalid-feedback">{{ error('descripcion') }}</div>
          </div>

          <div>
            <label for="archivo" class="form-label">
              Adjunto <span class="text-secondary">(PDF, imagen o texto, máx. 5 MB)</span>
            </label>
            <input
              id="archivo"
              type="file"
              class="form-control"
              :class="{ 'is-invalid': v$.archivo.$error }"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
              @change="alElegirArchivo"
            />
            <div class="invalid-feedback">{{ error('archivo') }}</div>
            <div v-if="tarea?.adjuntoNombre" class="form-text">Actual: {{ tarea.adjuntoNombre }} (se reemplaza si eliges otro)</div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="emit('cerrar')">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="guardando">
            {{ esEdicion ? 'Guardar cambios' : 'Crear tarea' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
