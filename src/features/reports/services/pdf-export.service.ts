import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { ExpenseReport, ChartData } from '../types';

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  data: ExpenseReport[];
  chartData: ChartData[];
  monthlyChartData: ChartData[];
  filters: {
    fechaInicio: string;
    fechaFin: string;
    tipoReporte: 'area' | 'proyecto';
  };
}

class PDFExportService {
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  }

  private formatDate(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${day}/${month}/${year}`;
  }

  private async createBarChart(
    pdf: jsPDF,
    data: ChartData[],
    title: string,
    yPosition: number
  ): Promise<number> {
    if (data.length === 0) return yPosition;

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const chartWidth = pageWidth - (2 * margin);
    const chartHeight = 120;
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    // Título del gráfico
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition);
    yPosition += 10;

    // Encontrar el valor máximo para escalar
    const maxValue = Math.max(...data.map(item => item.gasto));
    const maxMovements = Math.max(...data.map(item => item.movimientos));

    // Dibujar ejes
    const chartY = yPosition + 10;
    const chartBottom = chartY + chartHeight;

    // Eje Y (línea vertical)
    pdf.line(margin, chartY, margin, chartBottom);
    
    // Eje X (línea horizontal)
    pdf.line(margin, chartBottom, margin + chartWidth, chartBottom);

    // Dibujar barras
    data.forEach((item, index) => {
      const x = margin + (index * (barWidth + barSpacing)) + barSpacing / 2;
      const barHeight = (item.gasto / maxValue) * chartHeight;
      const barY = chartBottom - barHeight;

      // Color de la barra (verde para gastos)
      pdf.setFillColor(16, 185, 129); // Verde
      pdf.rect(x, barY, barWidth, barHeight, 'F');

      // Borde de la barra
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(x, barY, barWidth, barHeight, 'S');

      // Valor en la barra
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      const valueText = this.formatCurrency(item.gasto);
      const textWidth = pdf.getTextWidth(valueText);
      pdf.text(valueText, x + (barWidth - textWidth) / 2, barY - 5);

      // Nombre del área/proyecto
      pdf.setFontSize(8);
      const nameText = item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name;
      const nameWidth = pdf.getTextWidth(nameText);
      pdf.text(nameText, x + (barWidth - nameWidth) / 2, chartBottom + 5);

      // Número de movimientos
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      const movementsText = `${item.movimientos} mov.`;
      const movementsWidth = pdf.getTextWidth(movementsText);
      pdf.text(movementsText, x + (barWidth - movementsWidth) / 2, chartBottom + 12);
    });

    // Etiquetas de ejes
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Gastos (S/)', margin - 15, chartY + chartHeight / 2, { angle: 90 });
    pdf.text('Áreas/Proyectos', margin + chartWidth / 2, chartBottom + 25, { align: 'center' });

    return chartBottom + 40;
  }

  async exportExpenseReport(options: PDFExportOptions): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(16, 185, 129); // Verde
    pdf.text('REPORTE DE GASTOS MENSUALES', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Subtitle
    if (options.subtitle) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(options.subtitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }

    // Información del reporte
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Período: ${options.filters.fechaInicio} - ${options.filters.fechaFin}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Tipo de Reporte: ${options.filters.tipoReporte === 'area' ? 'Por Área' : 'Por Proyecto'}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Total de Registros: ${options.data.length}`, 20, yPosition);
    yPosition += 15;

    // Estadísticas resumidas
    const totalGastos = options.data.reduce((sum, item) => sum + item.costoTotal, 0);
    const areasUnicas = new Set(options.data.map(item => item.area)).size;
    const proyectosUnicos = new Set(options.data.filter(item => item.proyecto).map(item => item.proyecto!)).size;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RESUMEN EJECUTIVO', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Gastos: ${this.formatCurrency(totalGastos)}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Áreas Involucradas: ${areasUnicas}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Proyectos Involucrados: ${proyectosUnicos}`, 20, yPosition);
    yPosition += 15;

    // Gráfico principal
    if (options.chartData.length > 0) {
      const chartTitle = options.filters.tipoReporte === 'area' ? 'Gastos por Área' : 'Gastos por Proyecto';
      yPosition = await this.createBarChart(pdf, options.chartData, chartTitle, yPosition);
    }

    // Verificar si necesitamos una nueva página para el gráfico mensual
    if (yPosition > pageHeight - 150) {
      pdf.addPage();
      yPosition = 20;
    }

    // Gráfico mensual
    if (options.monthlyChartData.length > 0) {
      yPosition = await this.createBarChart(pdf, options.monthlyChartData, 'Gastos Mensuales', yPosition);
    }

    // Verificar si necesitamos una nueva página para la tabla
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = 20;
    }

    // Tabla de datos detallados
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DETALLE DE GASTOS', 20, yPosition);
    yPosition += 10;

    // Preparar datos para la tabla
    const tableData = options.data.map(item => [
      this.formatDate(item.fecha),
      item.area,
      item.proyecto || '-',
      item.codigoProducto,
      item.descripcion.length > 30 ? item.descripcion.substring(0, 30) + '...' : item.descripcion,
      item.cantidad.toString(),
      this.formatCurrency(item.precioUnitario),
      this.formatCurrency(item.costoTotal),
      item.responsable || '-'
    ]);

    // Agregar fila de totales
    tableData.push([
      '', '', '', '', '', '', 'TOTAL:', this.formatCurrency(totalGastos), ''
    ]);

    autoTable(pdf, {
      head: [['Fecha', 'Área', 'Proyecto', 'Código', 'Descripción', 'Cant.', 'Precio Unit.', 'Total', 'Responsable']],
      body: tableData,
      startY: yPosition,
      margin: { top: 20 },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didDrawPage: (data) => {
        // Footer en cada página
        const pageCount = pdf.getNumberOfPages();
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        pdf.text(
          `Generado el: ${new Date().toLocaleDateString('es-ES')}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: 'right' }
        );
      }
    });

    return pdf.output('blob');
  }

  async exportStockAlerts(
    alerts: any[],
    filters: any,
    statistics: any
  ): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(245, 101, 101); // Rojo
    pdf.text('ALERTAS DE STOCK', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Productos con stock por debajo del mínimo (10 unidades)', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Estadísticas
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('ESTADÍSTICAS', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Alertas: ${statistics.total}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Críticos: ${statistics.criticos}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Bajos: ${statistics.bajos}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Stock Actual: ${statistics.totalStock}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Stock Mínimo: ${statistics.stockMinimo}`, 20, yPosition);
    yPosition += 15;

    // Tabla de alertas
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRODUCTOS CON STOCK BAJO', 20, yPosition);
    yPosition += 10;

    const tableData = alerts.map(alert => [
      alert.estado.toUpperCase(),
      alert.codigo,
      alert.descripcion.length > 25 ? alert.descripcion.substring(0, 25) + '...' : alert.descripcion,
      alert.stockActual.toString(),
      alert.stockMinimo.toString(),
      alert.ubicacion,
      alert.categoria,
      alert.proveedor,
      new Date(alert.ultimaActualizacion).toLocaleDateString('es-ES')
    ]);

    autoTable(pdf, {
      head: [['Estado', 'Código', 'Descripción', 'Stock Actual', 'Stock Mínimo', 'Ubicación', 'Categoría', 'Proveedor', 'Última Actualización']],
      body: tableData,
      startY: yPosition,
      margin: { top: 20 },
      styles: {
        fontSize: 7,
        cellPadding: 1
      },
      headStyles: {
        fillColor: [245, 101, 101],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didDrawPage: (data) => {
        // Footer en cada página
        const pageCount = pdf.getNumberOfPages();
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        pdf.text(
          `Generado el: ${new Date().toLocaleDateString('es-ES')}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: 'right' }
        );
      }
    });

    return pdf.output('blob');
  }
}

export const pdfExportService = new PDFExportService();
