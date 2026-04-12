import { generateFilename } from "./exportHelpers.utils";
import ArabicReshaper from "arabic-reshaper";
import { loadArabicFonts } from "./pdfFonts.utils";
// Arabic text reshaper
function prepareArabicText(text) {
  if (!text || typeof text !== "string") return text ?? "";
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  if (!hasArabic) return text;
  // return ArabicReshaper.convertArabic(text);
  const reshaped = ArabicReshaper.convertArabic(text);
  return reshaped.split(" ").reverse().join(" ");
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
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  // ── Load and register Arabic font ──────────────────────────────────
  const fonts = await loadArabicFonts();
  doc.addFileToVFS("Amiri-Regular.ttf", fonts.regular);
  doc.addFileToVFS("Amiri-Bold.ttf", fonts.bold);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
  doc.setFont("Amiri", "normal");
  // ───────────────────────────────────────────────────────────────────

  const margins = { top: 20, right: 14, bottom: 20, left: 14 };
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Title — anchored to RIGHT edge (RTL reading start) ─────────────
  const reportTitle = formatReportTitle(report);
  doc.setFontSize(16);
  doc.setFont("Amiri", "bold");
  doc.text(reportTitle, pageWidth / 2, margins.top, {
    align: "center",
  });

  // Subtitle
  const farmName = farmRecord?.name || "";
  const palmTypeName = report?.palm_type?.name || "";
  const subtitle = prepareArabicText(`${farmName} — ${palmTypeName}`);
  doc.setFontSize(11);
  doc.setFont("Amiri", "normal");
  doc.text(subtitle, pageWidth / 2, margins.top + 8, { align: "center" });

  // Timestamp (LTR — dates are neutral)
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(new Date().toLocaleString(), pageWidth / 2, margins.top + 14, {
    align: "center",
  });
  doc.setTextColor(0);

  let currentY = margins.top + 22;

  // ── Column definitions ─────────────────────────────────────────────
  // NOTE: Arrays are defined in logical RTL order (rightmost column first).
  // We then REVERSE them before passing to autoTable so jsPDF renders them
  // left-to-right on paper, which reads right-to-left visually.

  const fertilizationColumns = [
    {
      header: t("farms.table.headers.fertilization_total"),
      key: "fertilization_total",
    },
    {
      header: t("farms.table.headers.fertilizer_quantity_per_palm_tree"),
      key: "fertilizer_quantity_per_palm_tree",
    },
    {
      header: t("farms.table.headers.type_of_fertilization"),
      key: "type_of_fertilization",
    },
    { header: t("farms.table.headers.date"), key: "date" },
    { header: t("farms.table.headers.day"), key: "day" },
  ];

  const irrigationColumns = [
    {
      header: t("farms.table.headers.total_duration_of_irrigation"),
      key: "total_duration_of_irrigation",
    },
    {
      header: t("farms.table.headers.total_amount_of_irrigation"),
      key: "total_amount_of_irrigation",
    },
    {
      header: t("farms.table.headers.duration_of_irrigation_per_palm_tree"),
      key: "duration_of_irrigation_per_palm_tree",
    },
    {
      header: t("farms.table.headers.irrigation_amount_per_palm_tree"),
      key: "irrigation_amount_per_palm_tree",
    },
    { header: t("farms.table.headers.date"), key: "date" },
    { header: t("farms.table.headers.day"), key: "day" },
  ];

  const sprayingColumns = [
    {
      header: t("farms.table.headers.amount_of_spray"),
      key: "amount_of_spray",
    },
    {
      header: t("farms.table.headers.spraying_per_tree"),
      key: "spraying_per_tree",
    },
    { header: t("farms.table.headers.spraying"), key: "spraying" },
    { header: t("farms.table.headers.date"), key: "date" },
    { header: t("farms.table.headers.day"), key: "day" },
  ];

  const SECTION_COLORS = {
    fertilization: "#2E7D32",
    irrigation: "#1565C0",
    spraying: "#E65100",
  };

  const weeks = mapWeeksReport(report);

  for (const week of weeks) {
    const weekTitle = t(`farms.form.options.week_number.${week.week_number}`);

    const sections = [
      {
        key: "fertilization",
        label: prepareArabicText(
          t("farms.table.headers.fertilization_section"),
        ),
        columns: fertilizationColumns,
        rows: buildFertilizationRows(week.days, report, numberOfTreesFor, t),
      },
      {
        key: "irrigation",
        label: prepareArabicText(t("farms.table.headers.irrigation_section")),
        columns: irrigationColumns,
        rows: buildIrrigationRows(week.days, t),
      },
      {
        key: "spraying",
        label: prepareArabicText(t("farms.table.headers.spraying_section")),
        columns: sprayingColumns,
        rows: buildSprayingRows(week.days, t),
      },
    ].filter(section => section.rows.length > 0);

    if (sections.length === 0) continue;

    for (const section of sections) {
      if (currentY > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        currentY = margins.top;
      }

      // ── Section title — RIGHT aligned ───────────────────────────────
      const sectionTitle = `${weekTitle} — ${section.label}`;
      doc.setFontSize(12);
      doc.setFont("Amiri", "bold");
      doc.setTextColor(40);
      doc.text(sectionTitle, pageWidth - margins.right, currentY, {
        align: "right",
      });
      doc.setTextColor(0);
      currentY += 4;

      // ── Build table data ────────────────────────────────────────────
      // Columns are already in RTL logical order (rightmost first).
      // Reversing makes the first RTL column land as the last LTR column
      // in the PDF, which is the rightmost physical column on paper — correct.
      const rtlColumns = [...section.columns];
      // const head = [rtlColumns.map((c) => prepareArabicText(c.header))];
      const head = [rtlColumns.map((c) => c.header)].reverse();
      // prepareArabicText
      const body = section.rows.map((row) =>
        rtlColumns.map((col) => String(row[col.key] ?? "")),
      );

      autoTable(doc, {
        head,
        body,
        startY: currentY,
        margin: margins,
        styles: {
          fontSize: 9,
          cellPadding: 2.5,
          overflow: "linebreak",
          halign: "right", // ← RTL: text right-aligned in every cell
          font: "Amiri",
        },
        headStyles: {
          fillColor: SECTION_COLORS[section.key],
          textColor: "#FFFFFF",
          fontStyle: "bold",
          halign: "right", // ← RTL header text
          font: "Amiri",
        },
        alternateRowStyles: { fillColor: "#F3F4F6" },
        tableWidth: "auto",
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }
  }

  // ── Page numbers ───────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  // ── Save ───────────────────────────────────────────────────────────
  const filename = generateFilename(
    `report_${farmRecord?.name || "farm"}`,
    "pdf",
  );
  doc.save(filename);
}

// ─── Row builders ──────────────────────────────────────────────────────────────
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
        f.fertilizer_quantity_per_palm_tree !== t("farms.form.no_quantity")
    );
    for (let i = 0; i < validFertilizations.length; i++) {
      const f = validFertilizations[i];
      rows.push({
        day: i === 0 ? getDayNameFromDate(day.date, t) : "",
        date: i === 0 ? day.date : "",
        type_of_fertilization: f.type_of_fertilization,
        fertilizer_quantity_per_palm_tree:
          f.fertilizer_quantity_per_palm_tree,
        fertilization_total: f.fertilization_total,
      });
    }
  }
  return rows;
}

function buildIrrigationRows(days, t) {
  return days
    .filter((day) => {
      const amt = day.irrigation_amount_per_palm_tree !== t("farms.form.no_quantity");
      const dur = day.duration_of_irrigation_per_palm_tree !== t("farms.form.no_quantity");
      return amt || dur;
    })
    .map((day) => ({
      day: getDayNameFromDate(day.date, t),
      date: day.date,
      irrigation_amount_per_palm_tree: day.irrigation_amount_per_palm_tree,
      duration_of_irrigation_per_palm_tree:
        day.duration_of_irrigation_per_palm_tree,
      total_amount_of_irrigation: day.total_amount_of_irrigation,
      total_duration_of_irrigation: day.total_duration_of_irrigation,
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
