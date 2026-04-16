import { generateFilename } from "./exportHelpers.utils";
import ArabicReshaper from "arabic-reshaper";
import { loadArabicFonts } from "./pdfFonts.utils";
import systemLogo from "@/assets/22.png";
// import systemLogo from "@/assets/لوجو مفرغ_.png";

function prepareArabicText(text) {
  if (!text || typeof text !== "string") return text ?? "";

  const hasArabic = /[\u0600-\u06FF]/.test(text);
  if (!hasArabic) return text;

  return ArabicReshaper.convertArabic(text);
}

function safeText(value) {
  return prepareArabicText(String(value ?? "").trim());
}

function drawRoundedFill(doc, x, y, w, h, color, radius = 4) {
  doc.setFillColor(color);
  doc.roundedRect(x, y, w, h, radius, radius, "F");
}

function drawRoundedStroke(doc, x, y, w, h, color, radius = 4, lineWidth = 0.25) {
  doc.setDrawColor(color);
  doc.setLineWidth(lineWidth);
  doc.roundedRect(x, y, w, h, radius, radius, "S");
}

function formatExportedAt() {
  try {
    const now = new Date();

    const date = new Intl.DateTimeFormat("en-GB", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    const time = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);

    return `${date} - ${time}`;
  } catch (_) {
    return "";
  }
}

async function imageUrlToDataUrl(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (_) {
    return null;
  }
}

function getImageFormatFromDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return "PNG";
  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) {
    return "JPEG";
  }
  if (dataUrl.startsWith("data:image/webp")) {
    return "WEBP";
  }
  return "PNG";
}

function getDayNameFromDate(dateStr, t) {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(year, month - 1, day);
  const dayIndex = date.getDay();
  return t(`reports.form.options.days.${dayIndex}`);
}

function buildFertilizationRows(days, report, numberOfTreesFor, t) {
  const rows = [];

  for (const day of days) {
    const validFertilizations = (day.fertilizations || []).filter(
      (f) =>
        f.type_of_fertilization !== t("farms.form.no_quantity") ||
        f.fertilizer_quantity_per_palm_tree !== t("farms.form.no_quantity"),
    );

    for (let i = 0; i < validFertilizations.length; i++) {
      const f = validFertilizations[i];
      rows.push({
        day: i === 0 ? getDayNameFromDate(day.date, t) : "",
        date: i === 0 ? day.date : "",
        type_of_fertilization: f.type_of_fertilization,
        fertilizer_quantity_per_palm_tree: f.fertilizer_quantity_per_palm_tree,
        fertilization_total: f.fertilization_total,
      });
    }
  }

  return rows;
}

function buildIrrigationRows(days, t) {
  return days
    .filter((day) => {
      const amt =
        day.irrigation_amount_per_palm_tree !== t("farms.form.no_quantity");
      const dur =
        day.duration_of_irrigation_per_palm_tree !== t("farms.form.no_quantity");
      return amt || dur;
    })
    .map((day) => ({
      day: getDayNameFromDate(day.date, t),
      date: day.date,
      irrigation_amount_per_palm_tree: day.irrigation_amount_per_palm_tree,
      duration_of_irrigation_per_palm_tree:
        day.duration_of_irrigation_per_palm_tree,
      total_amount_of_irrigation: day.total_amount_of_irrigation,
    }));
}

function buildSprayingRows(days, t) {
  return days
    .filter((day) => {
      const spray = day.spraying !== t("farms.form.no_quantity");
      const amt = day.amount_of_spray !== t("farms.form.no_quantity");
      return spray || amt;
    })
    .map((day) => ({
      day: getDayNameFromDate(day.date, t),
      date: day.date,
      spraying: day.spraying,
      spraying_per_tree: day.spraying_per_tree,
      amount_of_spray: day.amount_of_spray,
    }));
}

function drawMetaCard(doc, { x, y, w, h, label, value, accent }) {
  drawRoundedFill(doc, x, y, w, h, "#FFFFFF", 7);
  drawRoundedStroke(doc, x, y, w, h, "#DDE5EC", 7, 0.3);

  doc.setFillColor("#F8FAFC");
  doc.roundedRect(x + 2, y + 2, w - 4, h - 4, 6, 6, "F");

  doc.setFillColor(accent);
  doc.roundedRect(x + w - 5.5, y + 3.5, 3, h - 7, 2.5, 2.5, "F");

  doc.setFont("Amiri", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor("#64748B");
  doc.text(safeText(label), x + w - 10, y + 8, { align: "right" });

  doc.setDrawColor("#E2E8F0");
  doc.setLineWidth(0.2);
  doc.line(x + 8, y + 11.5, x + w - 12, y + 11.5);

  doc.setFont("Amiri", "bold");
  doc.setFontSize(13);
  doc.setTextColor("#0F172A");

  const lines = doc.splitTextToSize(safeText(value), w - 18);
  doc.text(lines, x + w - 10, y + 19, {
    align: "right",
    maxWidth: w - 18,
  });
}

function drawWeekHeader(doc, weekTitle, y, pageWidth, margins) {
  const x = margins.left;
  const w = pageWidth - margins.left - margins.right;

  drawRoundedFill(doc, x, y, w, 11, "#EEF2FF", 4);
  drawRoundedStroke(doc, x, y, w, 11, "#C7D2FE", 4, 0.25);

  doc.setFillColor("#4338CA");
  doc.circle(x + w - 6.5, y + 5.5, 1.8, "F");

  doc.setFont("Amiri", "bold");
  doc.setFontSize(12);
  doc.setTextColor("#312E81");
  doc.text(safeText(weekTitle), x + w - 11, y + 7.2, { align: "right" });
}

function drawSectionHeader(doc, title, y, pageWidth, margins, color) {
  const x = margins.left;
  const w = pageWidth - margins.left - margins.right;

  drawRoundedFill(doc, x, y, w, 9.5, "#FFFFFF", 4);
  drawRoundedStroke(doc, x, y, w, 9.5, "#E2E8F0", 4, 0.25);

  doc.setFillColor(color);
  doc.roundedRect(x + w - 4.8, y + 1.8, 2.6, 5.8, 2, 2, "F");

  doc.setFont("Amiri", "bold");
  doc.setFontSize(11);
  doc.setTextColor("#111827");
  doc.text(safeText(title), x + w - 9, y + 6.25, { align: "right" });
}

function drawPageFrame(doc, pageWidth, pageHeight) {
  drawRoundedStroke(doc, 7, 7, pageWidth - 14, pageHeight - 14, "#E5E7EB", 5, 0.25);
}

function drawSystemLogo(doc, logoData, pageWidth) {
  if (!logoData) return;

  try {
    const format = getImageFormatFromDataUrl(logoData);
    const logoW = 14;
    const logoH = 14;
    const x = pageWidth - 14 - logoW;
    const y = 10;

    doc.addImage(logoData, format, x, y, logoW, logoH);
  } catch (_) {}
}

function drawFooter(doc, pageNumber, pageCount, pageWidth, pageHeight) {
  const footerY = pageHeight - 9;

  drawRoundedFill(doc, pageWidth / 2 - 14, footerY - 4.3, 28, 7, "#0F172A", 3);

  doc.setFont("Amiri", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#FFFFFF");
  doc.text(`${pageNumber} / ${pageCount}`, pageWidth / 2, footerY, {
    align: "center",
  });

  doc.setFont("Amiri", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#64748B");
  doc.text(safeText("تم إنشاء التقرير تلقائيًا"), 15, footerY, {
    align: "left",
  });
}

export async function exportReportToPDF({
  report,
  farmRecord,
  t,
  mapWeeksReport,
  numberOfTreesFor,
  formatReportTitle,
}) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const fonts = await loadArabicFonts();
  doc.addFileToVFS("Amiri-Regular.ttf", fonts.regular);
  doc.addFileToVFS("Amiri-Bold.ttf", fonts.bold);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
  doc.setFont("Amiri", "normal");

  const margins = { top: 24, right: 14, bottom: 18, left: 14 };
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const THEME = {
    ink: "#0F172A",
    muted: "#64748B",
    line: "#E2E8F0",
    page: "#F8FAFC",
    fertilization: "#166534",
    irrigation: "#0F766E",
    spraying: "#C2410C",
  };

  const SECTION_COLORS = {
    fertilization: THEME.fertilization,
    irrigation: THEME.irrigation,
    spraying: THEME.spraying,
  };

  const reportTitle = safeText(formatReportTitle(report));
  const farmName = farmRecord?.name || "-";
  const palmTypeName = report?.palm_type?.name || "-";
  const treeCount =
    typeof numberOfTreesFor === "function" ? numberOfTreesFor(report) : "-";
  const exportedAt = formatExportedAt();

  const systemLogoData = await imageUrlToDataUrl(systemLogo);

  const fertilizationColumns = [
    {
      header: safeText(t("farms.table.headers.fertilization_total")),
      key: "fertilization_total",
    },
    {
      header: safeText(t("farms.table.headers.fertilizer_quantity_per_palm_tree")),
      key: "fertilizer_quantity_per_palm_tree",
    },
    {
      header: safeText(t("farms.table.headers.type_of_fertilization")),
      key: "type_of_fertilization",
    },
    { header: safeText(t("farms.table.headers.date")), key: "date" },
    { header: safeText(t("farms.table.headers.day")), key: "day" },
  ];

  const irrigationColumns = [
    {
      header: safeText(t("farms.table.headers.total_amount_of_irrigation")),
      key: "total_amount_of_irrigation",
    },
    {
      header: safeText(t("farms.table.headers.duration_of_irrigation_per_palm_tree")),
      key: "duration_of_irrigation_per_palm_tree",
    },
    {
      header: safeText(t("farms.table.headers.irrigation_amount_per_palm_tree")),
      key: "irrigation_amount_per_palm_tree",
    },
    { header: safeText(t("farms.table.headers.date")), key: "date" },
    { header: safeText(t("farms.table.headers.day")), key: "day" },
  ];

  const sprayingColumns = [
    {
      header: safeText(t("farms.table.headers.amount_of_spray")),
      key: "amount_of_spray",
    },
    {
      header: safeText(t("farms.table.headers.spraying_per_tree")),
      key: "spraying_per_tree",
    },
    { header: safeText(t("farms.table.headers.spraying")), key: "spraying" },
    { header: safeText(t("farms.table.headers.date")), key: "date" },
    { header: safeText(t("farms.table.headers.day")), key: "day" },
  ];

  function drawHeaderBlock() {
    const headerX = margins.left;
    const headerY = margins.top;
    const headerW = pageWidth - margins.left - margins.right;
    const headerH = 30;

    drawRoundedFill(doc, headerX, headerY, headerW, headerH, "#0F172A", 7);

    doc.setFont("Amiri", "bold");
    doc.setFontSize(20);
    doc.setTextColor("#FFFFFF");
    doc.text(reportTitle, pageWidth / 2, headerY + 10.5, { align: "center" });

    doc.setDrawColor("#334155");
    doc.setLineWidth(0.35);
    doc.line(headerX + 18, headerY + 23.3, headerX + headerW - 18, headerY + 23.3);

    const cardsY = headerY + headerH + 6;

    const colGap = 4;
    const rowGap = 4;
    const totalW = pageWidth - margins.left - margins.right;

    const cardW = (totalW - colGap) / 2;
    const cardH = 24;

    const firstColX = margins.left;
    const secondColX = margins.left + cardW + colGap;

    const firstRowY = cardsY;
    const secondRowY = cardsY + cardH + rowGap;

    drawMetaCard(doc, {
      x: secondColX,
      y: firstRowY,
      w: cardW,
      h: cardH,
      label: "اسم المزرعة",
      value: farmName,
      accent: "#2563EB",
    });

    drawMetaCard(doc, {
      x: firstColX,
      y: firstRowY,
      w: cardW,
      h: cardH,
      label: "تاريخ التصدير",
      value: exportedAt,
      accent: "#EA580C",
    });

    drawMetaCard(doc, {
      x: secondColX,
      y: secondRowY,
      w: cardW,
      h: cardH,
      label: "نوع النخل",
      value: palmTypeName,
      accent: "#16A34A",
    });

    drawMetaCard(doc, {
      x: firstColX,
      y: secondRowY,
      w: cardW,
      h: cardH,
      label: "عدد النخل",
      value: String(treeCount ?? "-"),
      accent: "#7C3AED",
    });

    return secondRowY + cardH + 8;
  }

  let currentY = drawHeaderBlock();
  const weeks = mapWeeksReport(report);

  for (const week of weeks) {
    const weekTitle = t(`farms.form.options.week_number.${week.week_number}`);

    const sections = [
      {
        key: "fertilization",
        label: t("farms.table.headers.fertilization_section"),
        columns: fertilizationColumns,
        rows: buildFertilizationRows(week.days, report, numberOfTreesFor, t),
      },
      {
        key: "irrigation",
        label: t("farms.table.headers.irrigation_section"),
        columns: irrigationColumns,
        rows: buildIrrigationRows(week.days, t),
      },
      {
        key: "spraying",
        label: t("farms.table.headers.spraying_section"),
        columns: sprayingColumns,
        rows: buildSprayingRows(week.days, t),
      },
    ].filter((section) => section.rows.length > 0);

    if (sections.length === 0) continue;

    if (currentY > pageHeight - 58) {
      doc.addPage();
      currentY = margins.top;
    }

    drawWeekHeader(doc, weekTitle, currentY, pageWidth, margins);
    currentY += 15;

    for (const section of sections) {
      if (currentY > pageHeight - 48) {
        doc.addPage();
        currentY = margins.top;
        drawWeekHeader(doc, weekTitle, currentY, pageWidth, margins);
        currentY += 15;
      }

      drawSectionHeader(
        doc,
        section.label,
        currentY,
        pageWidth,
        margins,
        SECTION_COLORS[section.key],
      );

      currentY += 12;

      const rtlColumns = [...section.columns];
      const head = [rtlColumns.map((c) => c.header)];
      const body = section.rows.map((row) =>
        rtlColumns.map((col) => safeText(row[col.key] ?? "")),
      );

      autoTable(doc, {
        head,
        body,
        startY: currentY,
        margin: margins,
        theme: "grid",
        tableWidth: "auto",
        styles: {
          font: "Amiri",
          fontSize: 9.5,
          cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
          textColor: "#0F172A",
          lineColor: "#E2E8F0",
          lineWidth: 0.2,
          halign: "right",
          valign: "middle",
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: SECTION_COLORS[section.key],
          textColor: "#FFFFFF",
          fontStyle: "bold",
          font: "Amiri",
          halign: "right",
          valign: "middle",
          lineColor: SECTION_COLORS[section.key],
          lineWidth: 0.2,
        },
        bodyStyles: {
          halign: "right",
          valign: "middle",
        },
        alternateRowStyles: {
          fillColor: "#F8FAFC",
        },
        columnStyles: {
          0: { cellWidth: 24 },
          1: { cellWidth: 28 },
          2: { cellWidth: "auto" },
          3: { cellWidth: "auto" },
          4: { cellWidth: "auto" },
        },
        didParseCell: (data) => {
          if (data.section === "body") {
            data.cell.styles.font = "Amiri";
          }
        },
        didDrawPage: () => {
          drawPageFrame(doc, pageWidth, pageHeight);
        },
      });

      currentY = doc.lastAutoTable.finalY + 8;
    }

    currentY += 2;
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawPageFrame(doc, pageWidth, pageHeight);
    drawSystemLogo(doc, systemLogoData, pageWidth);
    drawFooter(doc, i, pageCount, pageWidth, pageHeight);
  }

  const filename = generateFilename(
    `report_${farmRecord?.name || "farm"}`,
    "pdf",
  );

  doc.save(filename);
}