import { ref, computed } from "vue";
import { exportToPDF } from "@/utils/exporters/pdfExporter.utils";
import {
  formatValueForExport,
  stripHTMLTags,
  estimateFileSize,
  chunkArray,
} from "@/utils/exporters/exportHelpers.utils";

export function useTableExport(options = {}) {
  const {
    getData,
    getColumns,
    getSlotContent,
    onProgress,
    onComplete,
    onError,
    defaultConfig = {
      includeHeaders: true,
      pdf: {
        orientation: "landscape",
        pageSize: "a4",
        showPageNumbers: true,
        showTimestamp: true,
      },
      excel: {
        freezeHeader: true,
        autoFilter: true,
        boldHeaders: true,
      },
    },
  } = options;

  // State
  const isExporting = ref(false);
  const progress = ref({
    status: "idle",
    progress: 0,
    message: "",
    totalRows: 0,
    processedRows: 0,
  });

  /**
   * Update progress
   */
  const updateProgress = (update) => {
    progress.value = { ...progress.value, ...update };
    onProgress?.(progress.value);
  };

  /**
   * Prepare export data
   */
  const prepareExportData = async (data, columns, config) => {
    updateProgress({
      status: "preparing",
      message: "Preparing data for export...",
      totalRows: data.length,
      processedRows: 0,
    });

    // Filter columns
    let exportColumns = [...columns];

    if (config.columnsToExport) {
      exportColumns = exportColumns.filter((col) =>
        config.columnsToExport.includes(col.key),
      );
    }

    if (config.excludeColumns) {
      exportColumns = exportColumns.filter(
        (col) => !config.excludeColumns.includes(col.key),
      );
    }

    // Filter rows
    let exportData = config.maxRows ? data.slice(0, config.maxRows) : [...data];

    // Prepare rows with formatted values
    const exportRows = [];
    const chunkSize = 100; // Process in chunks for progress updates
    const chunks = chunkArray(exportData, chunkSize);

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];

      for (let i = 0; i < chunk.length; i++) {
        const row = chunk[i];
        const rowIndex = chunkIndex * chunkSize + i;
        const exportRow = {
          _original: row,
          _formatted: {},
        };

        // Process each column
        for (const column of exportColumns) {
          let value = row[column.key];

          // Try to get slot content first if available
          if (column.renderSlot && getSlotContent) {
            const slotContent = getSlotContent(column.key, row, rowIndex);
            if (slotContent !== null) {
              value = stripHTMLTags(slotContent);
            }
          }

          // Format the value
          const formattedValue = formatValueForExport(value, column, row);

          exportRow[column.key] = value;
          exportRow._formatted[column.key] = formattedValue;
        }

        exportRows.push(exportRow);
      }

      // Update progress
      const processedRows = Math.min(
        (chunkIndex + 1) * chunkSize,
        exportData.length,
      );
      updateProgress({
        processedRows,
        progress: Math.round((processedRows / exportData.length) * 50), // 0-50% for preparation
      });

      // Allow UI to update
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return { rows: exportRows, columns: exportColumns };
  };

  /**
   * Export data
   */
  const exportData = async (format, config = {}) => {
    const startTime = Date.now();

    try {
      isExporting.value = true;

      updateProgress({
        status: "preparing",
        progress: 0,
        message: "Starting export...",
      });

      // Get data and columns
      if (!getData || !getColumns) {
        throw new Error("getData and getColumns must be provided");
      }

      const data = await getData();
      const columns = getColumns();

      if (data.length === 0) {
        throw new Error("No data to export");
      }

      if (columns.length === 0) {
        throw new Error("No columns to export");
      }

      // Merge config with defaults
      const finalConfig = {
        ...defaultConfig,
        ...config,
        format,
        pdf: { ...defaultConfig.pdf, ...config.pdf },
        excel: { ...defaultConfig.excel, ...config.excel },
        csv: { ...defaultConfig.csv, ...config.csv },
        html: { ...defaultConfig.html, ...config.html },
      };

      // Prepare data
      const { rows, columns: exportColumns } = await prepareExportData(
        data,
        columns,
        finalConfig,
      );

      updateProgress({
        status: "exporting",
        progress: 50,
        message: `Generating ${format.toUpperCase()} file...`,
      });

      // Export based on format
      switch (format) {
        case "pdf":
          await exportToPDF(rows, exportColumns, finalConfig);
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      const duration = Date.now() - startTime;
      const fileSize = estimateFileSize(rows);

      const result = {
        success: true,
        filename: finalConfig.filename || `export.${format}`,
        format,
        rowCount: rows.length,
        columnCount: exportColumns.length,
        fileSize,
        duration,
      };

      updateProgress({
        status: "success",
        progress: 100,
        message: "Export completed successfully",
      });

      onComplete?.(result);

      return result;
    } catch (error) {
      const err = error;

      updateProgress({
        status: "error",
        progress: 0,
        message: err.message,
        error: err,
      });

      onError?.(err);

      return {
        success: false,
        filename: "",
        format,
        rowCount: 0,
        columnCount: 0,
        error: err,
      };
    } finally {
      isExporting.value = false;

      // Reset progress after 2 seconds
      setTimeout(() => {
        if (progress.value.status !== "idle") {
          updateProgress({
            status: "idle",
            progress: 0,
            message: "",
          });
        }
      }, 2000);
    }
  };

  // Export to PDF
  const exportPDF = (config) => {
    console.log("exportPDF", config);
    return exportData("pdf", config);
  };

  /**
   * Cancel export (if possible)
   */
  const cancelExport = () => {
    // Implementation depends on export method
    // For now, just reset state
    isExporting.value = false;
    updateProgress({
      status: "idle",
      progress: 0,
      message: "Export cancelled",
    });
  };

  return {
    // State
    isExporting,
    progress,

    // Methods
    exportData,
    exportPDF,
    cancelExport,
  };
}
