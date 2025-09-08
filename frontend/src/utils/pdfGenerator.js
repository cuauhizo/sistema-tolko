import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatStatus, formatWorkOrderId } from '@/utils/formatters';

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
    body: [
      [
        order.client_name || 'N/A',
        order.assigned_to,
        new Date(order.end_date).toLocaleDateString(),
      ],
    ],
    theme: 'striped',
  })

  // Sección de Descripción (usando autoTable para manejar el flujo)
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Descripción']],
    body: [[order.description || 'Sin descripción.']],
    theme: 'grid',
    headStyles: { fontStyle: 'bold' },
  })

  // Tabla 2: Productos/Materiales
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10, // Se posiciona automáticamente después de la descripción
    head: [['Producto Utilizado', 'Cantidad']],
    body: order.products.map((p) => [p.name, p.quantity_used]),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  })

  // Guardar el archivo
  doc.save(`OrdenDeTrabajo_${order.id}_${order.client_name || ''}.pdf`)
}
