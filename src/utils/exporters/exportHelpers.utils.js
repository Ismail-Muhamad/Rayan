// Format value for export
export function formatValueForExport(value, column, row) {
  // Use custom formatter if provided
  if (column.formatter) {
    try {
      return String(column.formatter(value, row));
    } catch (error) {
      console.error(`Formatter error for column ${column.key}:`, error);
      return String(value ?? "");
    }
  }

  // Handle null/undefined
  if (value == null) {
    return "";
  }

  // Handle different types
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Extract text content from HTML string
 */
export function stripHTMLTags(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

/**
 * Generate default filename with timestamp
 */
export function generateFilename(
  baseName = "export",
  format,
  includeTimestamp = true
) {
  let filename = baseName;

  if (includeTimestamp) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
    filename = `${baseName}_${timestamp}`;
  }

  return `${filename}.${format}`;
}

// Download blob as file
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// Estimate file size
export function estimateFileSize(data) {
  const jsonString = JSON.stringify(data);
  return new Blob([jsonString]).size;
}

// Format bytes to human readable
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Escape CSV value
export function escapeCSVValue(value, delimiter = ",", quoteChar = '"') {
  if (!value) return "";

  const needsQuoting =
    value.includes(delimiter) ||
    value.includes(quoteChar) ||
    value.includes("\n") ||
    value.includes("\r");

  if (needsQuoting) {
    const escaped = value.replace(
      new RegExp(quoteChar, "g"),
      quoteChar + quoteChar
    );
    return `${quoteChar}${escaped}${quoteChar}`;
  }

  return value;
}

// Convert data to CSV string
export function convertToCSV(rows, columns, options = {}) {
  const {
    delimiter = ",",
    quoteChar = '"',
    lineTerminator = "\r\n",
    includeHeaders = true,
  } = options;

  const lines = [];

  // Add headers
  if (includeHeaders) {
    const headers = columns.map((col) =>
      escapeCSVValue(col.label, delimiter, quoteChar)
    );
    lines.push(headers.join(delimiter));
  }

  // Add data rows
  rows.forEach((row) => {
    const values = columns.map((col) => {
      const value = row._formatted?.[col.key] ?? row[col.key] ?? "";
      return escapeCSVValue(String(value), delimiter, quoteChar);
    });
    lines.push(values.join(delimiter));
  });

  return lines.join(lineTerminator);
}

// Chunk array for progress updates
export function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
