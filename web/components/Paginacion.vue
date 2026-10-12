<script setup lang="ts">
const props = defineProps<{ pagina: number; totalPaginas: number }>();
const emit = defineEmits<{ cambiar: [number] }>();

const paginas = computed(() => Array.from({ length: props.totalPaginas }, (_, i) => i + 1));
</script>

<template>
  <nav v-if="totalPaginas > 1" aria-label="Paginación de tareas">
    <ul class="pagination justify-content-center flex-wrap mb-0">
      <li class="page-item" :class="{ disabled: pagina === 1 }">
        <button class="page-link" @click="emit('cambiar', pagina - 1)">Anterior</button>
      </li>
      <li v-for="n in paginas" :key="n" class="page-item" :class="{ active: n === pagina }">
        <button class="page-link" :aria-current="n === pagina ? 'page' : undefined" @click="emit('cambiar', n)">
          {{ n }}
        </button>
      </li>
      <li class="page-item" :class="{ disabled: pagina === totalPaginas }">
        <button class="page-link" @click="emit('cambiar', pagina + 1)">Siguiente</button>
      </li>
    </ul>
  </nav>
</template>
