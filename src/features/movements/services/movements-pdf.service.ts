import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MovementEntry, MovementExit } from "../types";

interface MovementsPDFOptions {
  type: "entradas" | "salidas";
  data: MovementEntry[] | MovementExit[];
  userName: string;
}

class MovementsPDFService {
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(value);
  }

  private formatDate(dateString: string): string {
    if (dateString.includes("/")) {
      return dateString;
    }
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private getCurrentDateTime(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  async exportMovements(options: MovementsPDFOptions): Promise<void> {
    const { type, data, userName } = options;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight(); // Obtenemos el alto de la página
    let yPosition = 20;

    // Título
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    const title =
      type === "entradas" ? "Movimientos - Entradas" : "Movimientos - Salidas";
    pdf.text(title, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Usuario y fecha
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Usuario: ${userName}`, 20, yPosition);
    yPosition += 6;
    pdf.text(
      `Fecha de generación: ${this.getCurrentDateTime()}`,
      20,
      yPosition
    );
    yPosition += 10;

    // Línea separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Preparar datos para la tabla
    if (type === "entradas") {
      const tableData = (data as MovementEntry[]).map((entry) => [
        this.formatDate(entry.fecha),
        entry.codigoProducto,
        entry.descripcion,
        entry.cantidad.toString(),
        this.formatCurrency(entry.precioUnitario),
        this.formatCurrency(entry.cantidad * entry.precioUnitario),
        entry.area || "-",
        entry.responsable || "-",
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [
          [
            "Fecha",
            "Código",
            "Descripción",
            "Cant.",
            "P. Unit.",
            "Total",
            "Área",
            "Responsable",
          ],
        ],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [59, 130, 246], // Azul
          textColor: 255,
          fontSize: 9,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 18 },
          2: { cellWidth: 45 },
          3: { cellWidth: 13, halign: "center" },
          4: { cellWidth: 18, halign: "right" },
          5: { cellWidth: 18, halign: "right" },
          6: { cellWidth: 23 },
          7: { cellWidth: "auto" },
        },
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
          const pageCount = (pdf as any).internal.getNumberOfPages();
          const currentPage = (pdf as any).internal.getCurrentPageInfo()
            .pageNumber;

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.text(
            `Página ${currentPage} de ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        },
      });

      // Calcular totales
      const totalCantidad = (data as MovementEntry[]).reduce(
        (sum, entry) => sum + entry.cantidad,
        0
      );
      const totalMonto = (data as MovementEntry[]).reduce(
        (sum, entry) => sum + entry.cantidad * entry.precioUnitario,
        0
      );

      // Obtenemos donde terminó la tabla
      let finalY = (pdf as any).lastAutoTable.finalY + 10;

      // Si finalY + 30mm supera el alto de la página, creamos nueva página
      if (finalY + 30 > pageHeight) {
        pdf.addPage();
        finalY = 20; // Reiniciamos Y en el margen superior de la nueva hoja
      }

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Total de registros: ${data.length}`, 20, finalY);
      pdf.text(`Total cantidad: ${totalCantidad}`, 20, finalY + 6);
      pdf.text(
        `Monto total: ${this.formatCurrency(totalMonto)}`,
        20,
        finalY + 12
      );
    } else {
      // Salidas
      const tableData = (data as MovementExit[]).map((exit) => [
        this.formatDate(exit.fecha),
        exit.codigoProducto,
        exit.descripcion,
        exit.cantidad.toString(),
        this.formatCurrency(exit.precioUnitario),
        this.formatCurrency(exit.cantidad * exit.precioUnitario),
        exit.area || "-",
        exit.proyecto || "-",
        exit.responsable || "-",
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [
          [
            "Fecha",
            "Código",
            "Descripción",
            "Cant.",
            "P. Unit.",
            "Total",
            "Área",
            "Proyecto",
            "Resp.",
          ],
        ],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [239, 68, 68], // Rojo
          textColor: 255,
          fontSize: 9,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 19 },
          1: { cellWidth: 17 },
          2: { cellWidth: 40 },
          3: { cellWidth: 12, halign: "center" },
          4: { cellWidth: 17, halign: "right" },
          5: { cellWidth: 17, halign: "right" },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 },
          8: { cellWidth: "auto" },
        },
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
          const pageCount = (pdf as any).internal.getNumberOfPages();
          const currentPage = (pdf as any).internal.getCurrentPageInfo()
            .pageNumber;

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.text(
            `Página ${currentPage} de ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        },
      });

      // Calcular totales para Salidas
      const totalCantidad = (data as MovementExit[]).reduce(
        (sum, exit) => sum + exit.cantidad,
        0
      );
      const totalMonto = (data as MovementExit[]).reduce(
        (sum, exit) => sum + exit.cantidad * exit.precioUnitario,
        0
      );

      let finalY = (pdf as any).lastAutoTable.finalY + 10;

      if (finalY + 30 > pageHeight) {
        pdf.addPage();
        finalY = 20;
      }

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Total de registros: ${data.length}`, 20, finalY);
      pdf.text(`Total cantidad: ${totalCantidad}`, 20, finalY + 6);
      pdf.text(
        `Monto total: ${this.formatCurrency(totalMonto)}`,
        20,
        finalY + 12
      );
    }

    // Descargar el PDF
    const fileName = `movimientos_${type}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
  }
}

export const movementsPDFService = new MovementsPDFService();
