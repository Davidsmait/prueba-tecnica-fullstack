import { defineStore } from 'pinia';
import type { FiltroEstado, Paginado, Resumen, Tarea, TareaEntrada } from '~/types/tarea';

export const useTareasStore = defineStore('tareas', {
  state: () => ({
    tareas: [] as Tarea[],
    total: 0,
    pagina: 1,
    limite: 6,
    totalPaginas: 1,
    filtro: 'todas' as FiltroEstado,
    buscar: '',
    cargando: false,
    resumen: { total: 0, completadas: 0, pendientes: 0 } as Resumen,
    procesando: [] as number[],
  }),

  getters: {
    progreso: (s) => (s.resumen.total ? Math.round((s.resumen.completadas / s.resumen.total) * 100) : 0),
    estaProcesando: (s) => (id: number) => s.procesando.includes(id),
  },

  actions: {
    async cargar(): Promise<void> {
      this.cargando = true;
      try {
        const query: Record<string, string | number | boolean> = { pagina: this.pagina, limite: this.limite };
        if (this.filtro !== 'todas') query.completado = this.filtro === 'completadas';
        if (this.buscar.trim()) query.buscar = this.buscar.trim();

        const [res] = await Promise.all([
          $fetch<Paginado<Tarea>>('/api/tareas', { query }),
          this.cargarResumen(),
        ]);
        if (res.pagina > res.totalPaginas && res.totalPaginas > 0) {
          this.pagina = res.totalPaginas;
          return this.cargar();
        }
        this.tareas = res.data;
        this.total = res.total;
        this.totalPaginas = res.totalPaginas;
      } finally {
        this.cargando = false;
      }
    },

    async cargarResumen() {
      this.resumen = await $fetch<Resumen>('/api/tareas/resumen');
    },

    async crear(datos: TareaEntrada, archivo?: File | null) {
      const tarea = await $fetch<Tarea>('/api/tareas', { method: 'POST', body: datos });
      if (archivo) await this.adjuntar(tarea.id, archivo);
      this.pagina = 1;
      await this.cargar();
    },

    async actualizar(id: number, datos: Partial<TareaEntrada>, archivo?: File | null) {
      await $fetch<Tarea>(`/api/tareas/${id}`, { method: 'PATCH', body: datos });
      if (archivo) await this.adjuntar(id, archivo);
      await this.cargar();
    },

    async alternar(tarea: Tarea): Promise<boolean> {
      const nuevo = !tarea.completado;
      this.procesando.push(tarea.id);
      try {
        await $fetch(`/api/tareas/${tarea.id}`, { method: 'PATCH', body: { completado: nuevo } });
        tarea.completado = nuevo;
        if (this.filtro === 'todas') await this.cargarResumen();
        else await this.cargar();
        return nuevo;
      } finally {
        this.procesando = this.procesando.filter((id) => id !== tarea.id);
      }
    },

    async eliminar(id: number) {
      await $fetch(`/api/tareas/${id}`, { method: 'DELETE' });
      await this.cargar();
    },

    async adjuntar(id: number, archivo: File) {
      const body = new FormData();
      body.append('archivo', archivo);
      await $fetch(`/api/tareas/${id}/adjunto`, { method: 'POST', body });
    },

    async irAPagina(pagina: number) {
      this.pagina = Math.min(Math.max(1, pagina), this.totalPaginas);
      await this.cargar();
    },

    async aplicarFiltro(filtro: FiltroEstado) {
      this.filtro = filtro;
      this.pagina = 1;
      await this.cargar();
    },
  },
});
