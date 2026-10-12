import useVuelidate from '@vuelidate/core';
import { helpers, maxLength, required } from '@vuelidate/validators';
import type { Tarea } from '~/types/tarea';

const TAMANO_MAXIMO = 5 * 1024 * 1024;

export function useTareaFormulario(inicial?: Tarea | null) {
  const form = reactive({
    titulo: inicial?.titulo ?? '',
    descripcion: inicial?.descripcion ?? '',
    archivo: null as File | null,
  });

  const reglas = {
    titulo: {
      required: helpers.withMessage('El título es obligatorio', required),
      maxLength: helpers.withMessage('Máximo 120 caracteres', maxLength(120)),
      noVacio: helpers.withMessage('El título no puede ser solo espacios', (v: string) => v.trim().length > 0),
    },
    descripcion: {
      maxLength: helpers.withMessage('Máximo 1000 caracteres', maxLength(1000)),
    },
    archivo: {
      tamano: helpers.withMessage('El archivo debe pesar menos de 5 MB', (f: File | null) => !f || f.size <= TAMANO_MAXIMO),
    },
  };

  const v$ = useVuelidate(reglas, form);

  function error(campo: 'titulo' | 'descripcion' | 'archivo') {
    return v$.value[campo].$errors[0]?.$message as string | undefined;
  }

  return { form, v$, error };
}
