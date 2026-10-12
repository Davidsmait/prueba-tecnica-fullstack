import type { SweetAlertIcon } from 'sweetalert2';

async function swal() {
  return (await import('sweetalert2')).default;
}

export function useAlertas() {
  async function toast(titulo: string, icon: SweetAlertIcon = 'success') {
    const Swal = await swal();
    await Swal.fire({ toast: true, position: 'top-end', icon, title: titulo, timer: 2200, showConfirmButton: false });
  }

  async function toastConDeshacer(titulo: string, alDeshacer: () => unknown) {
    const Swal = await swal();
    const { isConfirmed } = await Swal.fire({
      toast: true,
      position: 'bottom',
      icon: 'success',
      title: titulo,
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonText: 'Deshacer',
      customClass: { confirmButton: 'btn btn-sm btn-light fw-semibold' },
      buttonsStyling: false,
    });
    if (isConfirmed) await alDeshacer();
  }

  async function error(err: unknown, titulo = 'Algo salió mal') {
    const Swal = await swal();
    await Swal.fire({ icon: 'error', title: titulo, text: mensajeDeError(err) });
  }

  async function confirmar(titulo: string, texto: string) {
    const Swal = await swal();
    const { isConfirmed } = await Swal.fire({
      icon: 'warning',
      title: titulo,
      text: texto,
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      reverseButtons: true,
    });
    return isConfirmed;
  }

  return { toast, toastConDeshacer, error, confirmar };
}

function mensajeDeError(err: unknown): string {
  const data = (err as { data?: { message?: string | string[] } })?.data;
  if (Array.isArray(data?.message)) return data.message.join('\n');
  if (data?.message) return data.message;
  return 'No pudimos completar la operación. Intenta de nuevo.';
}
