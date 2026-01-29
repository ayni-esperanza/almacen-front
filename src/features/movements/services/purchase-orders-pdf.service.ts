import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PurchaseOrder, PurchaseOrderProduct } from "../types/purchases";

class PurchaseOrdersPDFService {
  /**
   * Genera un PDF de una orden de compra con sus productos
   */
  generatePurchaseOrderPDF(
    order: PurchaseOrder,
    products: PurchaseOrderProduct[],
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Título
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ORDEN DE COMPRA", pageWidth / 2, 20, { align: "center" });

    // Información de la orden
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Código: ${order.codigo}`, 10, 35);
    doc.text(`Fecha: ${order.fecha}`, 10, 42);

    // Tabla de productos
    const startY = 52;

    const tableData = products.map((product) => [
      product.fecha,
      product.codigo || "N/A",
      product.nombre,
      product.area,
      product.proyecto,
      product.responsable,
      product.cantidad.toString(),
      `S/ ${product.costoUnitario.toFixed(2)}`,
      `S/ ${product.subtotal.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY,
      margin: { left: 10 }, // Margen izquierdo más pequeño
      head: [
        [
          "Fecha",
          "Código",
          "Nombre",
          "Área",
          "Proyecto",
          "Responsable",
          "Cantidad",
          "Costo U.",
          "Subtotal",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [234, 88, 12], // orange-600
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 22 }, // Fecha
        1: { cellWidth: 20 }, // Código
        2: { cellWidth: 30 }, // Nombre
        3: { cellWidth: 20 }, // Área
        4: { cellWidth: 25 }, // Proyecto
        5: { cellWidth: 25 }, // Responsable
        6: { cellWidth: 15, halign: "right" }, // Cantidad
        7: { cellWidth: 20, halign: "right" }, // Costo U.
        8: { cellWidth: 20, halign: "right" }, // Subtotal
      },
      foot: [
        [
          "",
          "",
          "",
          "",
          "",
          "TOTALES:",
          products.reduce((sum, p) => sum + p.cantidad, 0).toString(),
          "",
          `S/ ${products.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}`,
        ],
      ],
      footStyles: {
        fillColor: [249, 250, 251], // gray-50
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 9,
      },
    });

    // Guardar PDF
    const fileName = `orden-compra-${order.codigo}.pdf`;
    doc.save(fileName);
  }
}

export const purchaseOrdersPDFService = new PurchaseOrdersPDFService();
