import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatStatus, formatWorkOrderId } from '@/utils/formatters'

export function generateWorkOrderPDF(order) {
  if (!order) return

  const doc = new jsPDF()

  // Título y detalles
  doc.setFontSize(20)
  doc.text('Orden de Trabajo', 105, 20, { align: 'center' })
  doc.setFontSize(12)
  doc.text(`Folio: ${formatWorkOrderId(order.id)}`, 20, 30)
  doc.text(`Estado: ${formatStatus(order.status)}`, 190, 30, { align: 'right' })

  // Tabla 1: Detalles del Cliente y Fechas
  autoTable(doc, {
    startY: 40,
    head: [['Cliente', 'Asignada a', 'Fecha Límite']],
    body: [[order.client_name || 'N/A', order.assigned_to || 'Sin asignar', order.end_date ? new Date(order.end_date).toLocaleDateString() : 'N/A']],
    theme: 'striped',
  })

  // Variable para controlar el espaciado dinámico hacia abajo
  let nextY = doc.lastAutoTable.finalY + 10

  // NUEVA SECCIÓN: Detalles de Producción (Medidas y Diseño)
  // Solo se dibuja si el usuario registró alguno de estos datos
  if (order.width || order.height || order.design_link) {
    const dimensions = order.width || order.height ? `${order.width || '?'} m  x  ${order.height || '?'} m` : 'No especificadas'

    autoTable(doc, {
      startY: nextY,
      head: [['Medidas de Impresión (Base x Altura)', 'Enlace de Diseño (URL)']],
      body: [[dimensions, order.design_link || 'Sin enlace adjunto']],
      theme: 'striped',
      headStyles: { fillColor: [100, 116, 139] }, // Un gris azulado sutil para diferenciar
    })

    // Actualizamos la posición Y para la siguiente tabla
    nextY = doc.lastAutoTable.finalY + 10
  }

  // Sección de Descripción
  autoTable(doc, {
    startY: nextY,
    head: [['Descripción del Trabajo']],
    body: [[order.description || 'Sin descripción.']],
    theme: 'grid',
    headStyles: { fontStyle: 'bold' },
  })

  // Tabla 2: Productos/Materiales
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Material / Producto Utilizado', 'Cantidad']],
    body: order.products && order.products.length > 0 ? order.products.map(p => [p.name, p.quantity_used]) : [['Ningún material registrado', '-']],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  })

  // Limpiar el nombre del archivo para que no de error si hay caracteres raros
  const safeClientName = (order.client_name || 'General').replace(/[^a-z0-9]/gi, '_')

  // Guardar el archivo
  doc.save(`OrdenDeTrabajo_${order.id}_${safeClientName}.pdf`)
}
