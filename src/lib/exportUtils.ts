import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatCurrency, formatDate } from "@/lib/formatter";
import i18n from "@/i18n";
import { toast } from "sonner";

// Always use English inside the PDF & Excel for consistency/font support
const getEn = () => i18n.getFixedT("en");

export const handleGeneratePDF = async (
  reportData: any,
  reportList: any[],
  periodText: string,
  mode: "download" | "share" = "download",
) => {
  try {
    const pt = getEn();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // 1. Header Banner (Indigo/Purple Gradient style)
    doc.setFillColor(99, 102, 241); // #6366f1
    doc.rect(0, 0, pageWidth, 45, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(
      pt("analytics.reports.title", "Financial Report").toUpperCase(),
      14,
      25,
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const generatedOnText = `${pt("analytics.reports.generatedOn", "Generated on")}: ${format(new Date(), "PPpp")}`;
    const periodDisplayText = `${pt("analytics.reports.period", "Period")}: ${periodText || "—"}`;
    doc.text(periodDisplayText, 14, 35);
    doc.text(generatedOnText, pageWidth - 14, 35, { align: "right" });

    // 2. Summary Cards (mimic mobile background/border colors)
    const cardWidth = (pageWidth - 14 * 2 - 6 * 3) / 4;
    const cardY = 55;
    const cardHeight = 25;

    const cards = [
      {
        label: pt("analytics.reports.totalIncome", "Total Income"),
        value: formatCurrency(reportData?.totalIncome || 0),
        bgColor: [240, 253, 244], // #f0fdf4
        borderColor: [187, 247, 208], // #bbf7d0
        textColor: [16, 185, 129], // #10b981
      },
      {
        label: pt("analytics.reports.cogs", "COGS"),
        value: formatCurrency(reportData?.totalCOGS || 0),
        bgColor: [255, 251, 235], // #fffbeb
        borderColor: [253, 230, 138], // #fde68a
        textColor: [217, 119, 6], // #d97706
      },
      {
        label: pt("analytics.reports.totalExpenses", "Expenses"),
        value: formatCurrency(reportData?.totalExpenses || 0),
        bgColor: [255, 241, 242], // #fff1f2
        borderColor: [254, 205, 211], // #fecdd3
        textColor: [239, 68, 68], // #ef4444
      },
      {
        label: pt("analytics.reports.grossProfit", "Gross Profit"),
        value: formatCurrency(reportData?.grossProfit || 0),
        bgColor: [245, 243, 255], // #f5f3ff
        borderColor: [221, 214, 254], // #ddd6fe
        textColor: [139, 92, 246], // #8b5cf6
      },
    ];

    cards.forEach((card, i) => {
      const x = 14 + i * (cardWidth + 6);

      // Draw background
      doc.setFillColor(card.bgColor[0], card.bgColor[1], card.bgColor[2]);
      doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, "F");

      // Draw border
      doc.setDrawColor(
        card.borderColor[0],
        card.borderColor[1],
        card.borderColor[2],
      );
      doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, "S");

      // Draw text
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "bold");
      doc.text(card.label.toUpperCase(), x + 4, cardY + 8, {
        maxWidth: cardWidth - 8,
      });

      doc.setFontSize(12);
      doc.setTextColor(card.textColor[0], card.textColor[1], card.textColor[2]);
      doc.text(card.value, x + 4, cardY + 18);
    });

    // 3. Table Header
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      pt("analytics.reports.detailedTransactions", "Detailed Transactions"),
      14,
      95,
    );

    const tableColumn = [
      pt("analytics.reports.columns.date", "Date"),
      pt("analytics.reports.columns.type", "Type"),
      pt("analytics.reports.columns.details", "Details"),
      pt("analytics.reports.columns.revenue", "Revenue"),
      pt("analytics.reports.columns.cogsExpense", "COGS / Expense"),
      pt("analytics.reports.columns.profit", "Profit"),
    ];

    const tableRows = (reportList || []).map((item: any) => {
      const isSale = item.type === "SALE";
      const itemDate = new Date(item.createdAt);

      return [
        formatDate(itemDate),
        isSale
          ? pt("analytics.reports.types.sale", "Sale")
          : pt("analytics.reports.types.expense", "Expense"),
        isSale
          ? `${item.totalNumberOfItemsSold} ${pt("analytics.reports.itemsSold", "item(s) sold")}`
          : item.reason || pt("analytics.reports.notAvailable", "N/A"),
        isSale ? formatCurrency(item.totalSaleValue) : "—",
        isSale
          ? formatCurrency(item.totalCOGSValue)
          : formatCurrency(item.amount),
        isSale ? formatCurrency(item.totalProfitValue) : "—",
      ];
    });

    autoTable(doc, {
      startY: 102,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [79, 70, 229], // Indigo 600
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
        cellPadding: 4,
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        font: "helvetica",
      },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right", textColor: [100, 100, 100] },
        5: { halign: "right", fontStyle: "bold" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          const type = data.cell.raw;
          if (type === pt("analytics.reports.types.sale", "Sale")) {
            data.cell.styles.textColor = [5, 150, 105]; // emerald-600
          } else {
            data.cell.styles.textColor = [220, 38, 38]; // red-600
          }
        }
        if (data.section === "body" && data.column.index === 5) {
          const text = data.cell.text[0] || "";
          if (text !== "—" && !text.includes("-")) {
            data.cell.styles.textColor = [16, 185, 129]; // emerald-500
          }
        }
      },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "AimStock Financial Report — Generated by AIM Technologies",
      pageWidth / 2,
      finalY + 15,
      { align: "center" },
    );

    const filename = `Financial_Report_${format(new Date(), "yyyyMMdd")}.pdf`;

    if (mode === "share") {
      const blob = doc.output("blob");
      const file = new File([blob], filename, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: pt("analytics.reports.sharePdf", "Share as PDF"),
          });
        } catch (shareErr) {
          console.warn("Sharing failed, falling back to download", shareErr);
          doc.save(filename);
        }
      } else {
        toast.error(
          i18n.t(
            "common.shareNotSupported",
            "Sharing is not supported on this device.",
          ),
        );
        doc.save(filename);
      }
    } else {
      doc.save(filename);
    }
  } catch (err) {
    console.error("PDF generation failed:", err);
    toast.error("Failed to generate PDF.");
  }
};

export const handleGenerateExcel = async (
  reportData: any,
  reportList: any[],
  mode: "download" | "share" = "download",
) => {
  try {
    const pt = getEn();
    const wb = XLSX.utils.book_new();

    // === Summary Sheet ===
    const summaryRows: any[][] = [
      [pt("analytics.reports.title", "Financial Report"), ""],
      [
        pt("analytics.reports.generatedOn", "Generated on"),
        format(new Date(), "PPpp"),
      ],
      ["", ""],
      [
        pt("analytics.reports.totalIncome", "Total Income"),
        reportData?.totalIncome ?? 0,
      ],
      [
        pt("analytics.reports.cogs", "Cost of Goods Sold (COGS)"),
        reportData?.totalCOGS ?? 0,
      ],
      [
        pt("analytics.reports.totalExpenses", "Total Expenses"),
        reportData?.totalExpenses ?? 0,
      ],
      [
        pt("analytics.reports.grossProfit", "Gross Profit"),
        reportData?.grossProfit ?? 0,
      ],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    wsSummary["!cols"] = [{ wch: 40 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // === Transactions Sheet ===
    const headers = [
      pt("analytics.reports.columns.date", "Date"),
      pt("analytics.reports.columns.type", "Type"),
      pt("analytics.reports.columns.details", "Details"),
      pt("analytics.reports.columns.revenue", "Revenue"),
      pt("analytics.reports.columns.cogsExpense", "COGS / Expense"),
      pt("analytics.reports.columns.profit", "Profit"),
    ];

    const dataRows: any[][] = (reportList || []).map((item: any) => {
      const isSale = item.type === "SALE";
      return [
        formatDate(new Date(item.createdAt)),
        isSale
          ? pt("analytics.reports.types.sale", "Sale")
          : pt("analytics.reports.types.expense", "Expense"),
        isSale
          ? `${item.totalNumberOfItemsSold ?? 0} ${pt("analytics.reports.itemsSold", "item(s) sold")}`
          : item.reason || pt("analytics.reports.notAvailable", "N/A"),
        isSale ? (item.totalSaleValue ?? 0) : 0,
        isSale ? (item.totalCOGSValue ?? 0) : (item.amount ?? 0),
        isSale ? (item.totalProfitValue ?? 0) : 0,
      ];
    });

    const wsTransactions = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    wsTransactions["!cols"] = [
      { wch: 22 },
      { wch: 14 },
      { wch: 40 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, wsTransactions, "Transactions");

    const filename = `Financial_Report_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`;

    if (mode === "share") {
      // Try Web Share API first
      const success = await tryShareExcel(wb, filename, pt);

      if (!success) {
        // Fallback: Always download if sharing fails
        XLSX.writeFile(wb, filename);
        toast.info("Sharing not available — file downloaded instead.");
      }
    } else {
      XLSX.writeFile(wb, filename);
    }
  } catch (err) {
    console.error("Excel generation failed:", err);
    toast.error("Failed to generate Excel file.");
  }
};

// ─────────────────────────────────────────────────────────────
// Helper function for better sharing logic
// ─────────────────────────────────────────────────────────────
const tryShareExcel = async (
  workbook: XLSX.WorkBook,
  filename: string,
  pt: any,
): Promise<boolean> => {
  try {
    const u8 = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const blob = new Blob([u8], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const file = new File([blob], filename, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Stronger check for file sharing support
    if (
      navigator.canShare &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: pt("analytics.reports.shareExcel", "Share Financial Report"),
        text: "Financial Report - AIM Stock",
      });
      return true;
    }

    // Fallback: Copy to clipboard as blob URL (some mobile browsers support this)
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return false; // We did download as fallback
  } catch (err) {
    console.warn("Share failed, using download fallback:", err);
    return false;
  }
};
