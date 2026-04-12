import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
export function exportToCSV(data) {
  const items = data; // Replace with your array of objects
  const fields = Object.keys(items[0]); // Get the field names from the first object

  // Create the CSV string
  const csv = [
    fields.join(","), // Header row
    ...items.map((item) => fields.map((field) => item[field]).join(",")), // Data rows
  ].join("\n");

  // Create a download link
  const downloadLink = document.createElement("a");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  downloadLink.href = url;
  downloadLink.download = "data.csv";

  // Trigger the download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

export function exportToExcel(data) {
  const items = data; // Replace with your array of objects

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert the data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(items);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Generate the Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  // Save the Excel file
  saveExcelFile(excelBuffer, "data.xlsx");
}

function saveExcelFile(buffer, fileName) {
  const data = new Blob([buffer], { type: "application/octet-stream" });

  if (typeof window.navigator.msSaveBlob !== "undefined") {
    // For IE browser
    window.navigator.msSaveBlob(data, fileName);
  } else {
    // For modern browsers
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
export function exportToPDF(data, width = 2000) {
  const body = [[]];
  const dataFiltered = Object.keys(data[0]);
  let val = {};

  for (let i = 0; i < dataFiltered.length; i++) {
    const text = dataFiltered[i];
    body[0].push({ text });
  }
  for (let i = 0; i < data.length; i++) {
    val = data[i];
    body.push(Object.values(val));
  }
  const docDefinition = {
    pageSize: {
      width,
      height: "auto",
    },
    content: [
      {
        layout: "lightHorizontalLines",
        pageMargins: [5, 5, 5, 5],
        pageOrientation: "landscape",
        table: {
          headerRows: 1,
          body,
        },
      },
    ],
  };
  const pdf = pdfMake.createPdf(docDefinition);
  pdf.download();
}
