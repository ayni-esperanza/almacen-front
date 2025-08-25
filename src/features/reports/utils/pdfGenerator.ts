import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MovementExit } from '../../movements/types';

export const generateExitReport = (exits: MovementExit[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94); // Green color
  doc.text('Sistema de Inventario', 20, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Reporte de Salidas de Productos', 20, 35);
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 20, 45);
  
  // Table
  const tableData = exits.map(exit => [
    exit.fecha,
    exit.codigoProducto,
    exit.descripcion,
    `S/ ${exit.precioUnitario.toFixed(2)}`,
    exit.cantidad.toString(),
    exit.responsable || '-',
    exit.area || '-'
  ]);
  
  autoTable(doc, {
    head: [['Fecha', 'Código', 'Descripción', 'Precio Unit.', 'Cantidad', 'Responsable', 'Área']],
    body: tableData,
    startY: 55,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 197, 94], // Green color
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });
  
  // Summary
  const totalItems = exits.reduce((sum, exit) => sum + exit.cantidad, 0);
  const totalValue = exits.reduce((sum, exit) => sum + (exit.precioUnitario * exit.cantidad), 0);
  
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Resumen:', 20, finalY);
  
  doc.setFontSize(10);
  doc.text(`Total de productos: ${totalItems}`, 20, finalY + 10);
  doc.text(`Valor total: S/ ${totalValue.toFixed(2)}`, 20, finalY + 20);
  doc.text(`Número de movimientos: ${exits.length}`, 20, finalY + 30);
  
  // Save
  doc.save(`reporte-salidas-${new Date().toISOString().split('T')[0]}.pdf`);
};
