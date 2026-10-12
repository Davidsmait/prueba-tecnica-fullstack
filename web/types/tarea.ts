export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string | null;
  completado: boolean;
  fechaCreacion: string;
  adjuntoNombre: string | null;
}

export interface Paginado<T> {
  data: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export type FiltroEstado = 'todas' | 'pendientes' | 'completadas';

export interface TareaEntrada {
  titulo: string;
  descripcion?: string;
  completado?: boolean;
}

export interface Resumen {
  total: number;
  completadas: number;
  pendientes: number;
}
