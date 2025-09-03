export function hideModal(elementId) {
  // 1. Ocultar la ventana principal del modal
  const modalElement = document.getElementById(elementId);
  if (modalElement) {
    modalElement.classList.remove('show');
    modalElement.style.display = 'none';
    modalElement.removeAttribute('aria-modal');
    modalElement.setAttribute('aria-hidden', 'true');
  }

  // 2. BUSCAR Y ELIMINAR TODOS LOS FONDOS EXISTENTES
  // Usamos querySelectorAll para obtener una lista de todos los backdrops
  const backdrops = document.querySelectorAll('.modal-backdrop');
  if (backdrops.length > 0) {
    // Recorremos la lista y los eliminamos uno por uno
    backdrops.forEach(backdrop => {
      backdrop.remove();
    });
  }

  // 3. Restaurar el scroll en la página principal
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}