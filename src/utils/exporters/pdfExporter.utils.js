import { downloadBlob, generateFilename } from "./exportHelpers.utils";

export async function exportToPDF(rows, columns, config = {}) {
  // Dynamic import
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const { filename, pdf = {}, includeHeaders = true } = config;

  const {
    orientation = "landscape",
    pageSize = "a4",
    margins = { top: 20, right: 14, bottom: 20, left: 14 },
    fontSize = 10,
    title = "",
    subtitle = "",
    showPageNumbers = true,
    showTimestamp = true,
    headerColor = "#4472C4",
    alternateRowColors = true,
    fitToPage = true,
    compress = true,
  } = pdf;

  // Create PDF
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: pageSize,
    compress,
  });

  // Add title
  if (title) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text(title, margins.left, margins.top);
  }

  // Add subtitle
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text(subtitle, margins.left, margins.top + 8);
  }

  // Add timestamp
  if (showTimestamp) {
    const timestamp = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Generated: ${timestamp}`,
      margins.left,
      margins.top + (title || subtitle ? 14 : 0)
    );
    doc.setTextColor(0);
  }

  // Prepare table data
  const headers = includeHeaders ? [columns.map((col) => col.label)] : [];

  const body = rows.map((row) =>
    columns.map((col) => {
      const value = row._formatted?.[col.key] ?? row[col.key];
      return String(value ?? "");
    })
  );

  // Calculate start position
  const startY =
    margins.top +
    (title ? 10 : 0) +
    (subtitle ? 8 : 0) +
    (showTimestamp ? 6 : 0);

  // Generate table
  autoTable(doc, {
    head: headers,
    body: body,
    startY: startY,
    margin: margins,
    styles: {
      fontSize: fontSize,
      cellPadding: 3,
      overflow: "linebreak",
      halign: "left",
    },
    headStyles: {
      fillColor: headerColor,
      textColor: "#FFFFFF",
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: alternateRowColors
      ? { fillColor: "#F3F4F6" }
      : undefined,
    columnStyles: columns.reduce((acc, col, index) => {
      acc[index] = {
        cellWidth: fitToPage ? "auto" : col.width || "auto",
        halign: col.align || "left",
      };
      return acc;
    }, {}),
    didDrawPage: (data) => {
      // Page numbers
      if (showPageNumbers) {
        const pageCount = doc.getNumberOfPages();
        const pageNumber = doc.getCurrentPageInfo().pageNumber;

        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Page ${pageNumber} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }
    },
  });

  // Save
  const finalFilename = filename || generateFilename("export", "pdf");
  doc.save(finalFilename);
}
