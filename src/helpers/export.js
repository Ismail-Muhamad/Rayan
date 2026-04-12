import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

export const generateTableData = (headersItems, items) => {
  // const tableData = items.map((item) => {
  //   const row = headersItems.reduce((acc, header) => {
  //     acc[header.value] = item[header.value];
  //     return acc;
  //   }, {});
  //   return row;
  // });
  // return tableData;
  // Generate CSV content from table data
  // const headers = headersItems.map((header) => header.text);
  // const rows = items.map((item) =>
  //   headersItems.map((header) => item[header.value]).join(",")
  // );
  // return [headers.join(","), ...rows].join("\n");
};

export const generatePDF = (headers = [], items = []) => {
  const doc = new jsPDF();
  const tableData = generateTableData(headers, items);

  doc.save("data.pdf");
};

export const generateExcel = (excelData) => {
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = {
    Sheets: { data: worksheet },
    SheetNames: ["data"],
  };
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([excelBuffer], { type: "application/vnd.ms.excel" });
  saveAs(blob, "data.xlsx");
};

export const generateCSV = (csvData) => {
  const worksheet = XLSX.utils.json_to_sheet(csvData);
  const csvBuffer = XLSX.write(worksheet, { type: "array", bookType: "csv" });
  const blob = new Blob([csvBuffer], { type: "text/csv;charset=utf-8" });
  saveAs(blob, "data.csv");
};
