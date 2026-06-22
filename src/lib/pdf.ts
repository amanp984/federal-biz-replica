import jsPDF from "jspdf";
import type { User } from "./auth-store";
import {
  type Transaction,
  withRunningBalance,
} from "./transactions-store";
import { formatDDMMYYYY } from "./format-date";

// jsPDF's built-in Helvetica uses WinAnsi encoding which has no glyph for
// the Indian Rupee sign (U+20B9). Using it in the PDF produces broken
// output (stray superscript chars + apparent "letter spacing"). Render
// currency with an ASCII "Rs." prefix in PDFs only.
const inrNumber = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
// "Rs." prefix kept for non-table contexts (summary tiles, info block).
const formatINRPdf = (n: number) => "Rs. " + inrNumber(n);
// Plain numeric for the ledger table columns (Withdrawals/Deposits/Balance),
// the Closing Balance row, and the Grand Total row — like a real bank PDF.
const formatNumPdf = (n: number) => inrNumber(n);

/**
 * A4 LANDSCAPE bank-style account statement.
 * Wide canvas (297mm) eliminates the column-collision issues of the previous
 * portrait layout. Strict, well-spaced two-column info grid; clean 8-column
 * ledger; summary band with totals and closing balance.
 */
export function downloadStatementPDF(
  user: User,
  txs: Transaction[],
  periodLabel?: string,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();   // 297
  const H = doc.internal.pageSize.getHeight();  // 210
  const M = 10;
  const innerW = W - 2 * M;

  const running = withRunningBalance(txs); // newest first w/ balance
  const ordered = running.slice().reverse(); // oldest -> newest for ledger
  const opening = 0;
  const closing = running[0]?.balance ?? 0;
  const totalDebit = ordered.reduce((s, t) => s + (t.debit || 0), 0);
  const totalCredit = ordered.reduce((s, t) => s + (t.credit || 0), 0);

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const period =
    periodLabel ?? `${formatDDMMYYYY(firstOfMonth)} to ${formatDDMMYYYY(today)}`;

  // ---- Layout constants
  const HEADER_H = 18;
  const COMPACT_HEADER_H = 14;
  const INFO_H = 50;
  const TOP_TILE_H = 18;
  const FOOTER_H = 12;
  const TABLE_HEAD_H = 8;
  const ROW_H = 7;
  const limitY = H - FOOTER_H - 4;

  // ---- Columns (sum to innerW). 8 columns, generous Particulars.
  const labels = ["Date", "Particulars", "Txn ID", "Type", "Withdrawals", "Deposits", "Balance", "Dr/Cr"];
  const aligns: ("left" | "right" | "center")[] = [
    "left", "left", "left", "center", "right", "right", "right", "center",
  ];
  // widened Balance + Dr/Cr to prevent currency overlap with adjacent cells
  const colW = [22, 96, 36, 14, 30, 30, 40, 20]; // 288
  const sum = colW.reduce((a, b) => a + b, 0);
  const scale = innerW / sum;
  const widths = colW.map((w) => w * scale);
  const colX: number[] = [];
  { let x = M; for (const w of widths) { colX.push(x); x += w; } }

  // ---- Drawing helpers
  const drawHeader = () => {
    doc.setFillColor(28, 65, 165);
    doc.rect(0, 0, W, HEADER_H, "F");
    doc.setFillColor(245, 158, 11);
    doc.rect(0, HEADER_H, W, 1.5, "F");

    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("FED BUSINESS", M, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Your Business Banking Partner", M, 15);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Statement of Account", W - M, 9, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(`Generated: ${today.toLocaleString("en-IN")}`, W - M, 13.5, { align: "right" });
    doc.text("support@fedbusiness.com  |  1800-425-0000", W - M, 17, { align: "right" });
  };

  // Compact header for continuation pages — no full info block.
  const drawCompactHeader = (pageNum: number) => {
    doc.setFillColor(28, 65, 165);
    doc.rect(0, 0, W, COMPACT_HEADER_H, "F");
    doc.setFillColor(245, 158, 11);
    doc.rect(0, COMPACT_HEADER_H, W, 1.2, "F");

    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("FED BUSINESS", M, 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Statement of Account (continued)", M + 60, 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.text(
      `A/C: ${user.accountNumber}   |   Period: ${period}   |   Page ${pageNum}`,
      W - M,
      9,
      { align: "right" },
    );
  };

  const drawInfoBlock = () => {
    const top = HEADER_H + 4;
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.rect(M, top, innerW, INFO_H);

    // 2-column split
    const midX = M + innerW / 2;
    doc.line(midX, top, midX, top + INFO_H - 8);

    // Period strip (footer band of info block)
    const stripY = top + INFO_H - 8;
    doc.setFillColor(240, 244, 252);
    doc.rect(M, stripY, innerW, 8, "F");
    doc.line(M, stripY, M + innerW, stripY);
    doc.setTextColor(28, 65, 165);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(
      `Statement Period: ${period}`,
      M + innerW / 2,
      stripY + 5.5,
      { align: "center" },
    );

    // Field rendering: label column 38mm, value column rest
    const left: [string, string][] = [
      ["Account Holder", user.customerName],
      ["Customer ID", user.customerId],
      ["CIF", user.cif],
      ["Account Number", user.accountNumber],
      ["Account Type", `${user.accountType} Account`],
      ["IFSC Code", user.ifsc],
      ["Currency", "INR"],
    ];
    const right: [string, string][] = [
      ["Branch", user.branch],
      ["Branch Address", user.branchAddress],
      ["Mobile", user.mobile],
      ["Email", user.email],
      ["Account Status", "ACTIVE"],
      ["Mode of Operation", "SINGLE"],
      ["Effective Available Balance", formatINRPdf(closing)],
    ];

    const rowH = (INFO_H - 8) / left.length;
    const writeCol = (data: [string, string][], xLabel: number, xValue: number, maxValueW: number) => {
      doc.setFontSize(8.5);
      data.forEach(([k, v], i) => {
        const y = top + (i + 0.5) * rowH + 2;
        doc.setTextColor(110);
        doc.setFont("helvetica", "normal");
        doc.text(k, xLabel, y);
        doc.setTextColor(15);
        doc.setFont("helvetica", "bold");
        const lines = doc.splitTextToSize(String(v ?? ""), maxValueW) as string[];
        doc.text(lines[0] ?? "", xValue, y);
      });
    };
    const colHalfW = innerW / 2;
    writeCol(left, M + 3, M + 45, colHalfW - 50);
    writeCol(right, midX + 3, midX + 45, colHalfW - 50);
  };

  // Page-1 summary tiles: Opening, Total Credits, Total Debits, Closing.
  const drawTopSummary = (yTop: number) => {
    const tileW = (innerW - 9) / 4;
    const tiles: [string, string][] = [
      ["Opening Balance", formatINRPdf(opening)],
      ["Total Credits", formatINRPdf(totalCredit)],
      ["Total Debits", formatINRPdf(totalDebit)],
      ["Closing Balance", formatINRPdf(closing)],
    ];
    tiles.forEach(([label, val], i) => {
      const tx = M + i * (tileW + 3);
      doc.setFillColor(248, 250, 253);
      doc.setDrawColor(210);
      doc.setLineWidth(0.2);
      doc.rect(tx, yTop, tileW, TOP_TILE_H, "FD");
      doc.setTextColor(110);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(label.toUpperCase(), tx + 3, yTop + 6);
      doc.setTextColor(28, 65, 165);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(val, tx + 3, yTop + 13.5);
    });
  };

  const drawTableHeader = (y: number) => {
    doc.setFillColor(28, 65, 165);
    doc.rect(M, y, innerW, TABLE_HEAD_H, "F");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    labels.forEach((label, i) => {
      const x =
        aligns[i] === "right"
          ? colX[i] + widths[i] - 2
          : aligns[i] === "center"
          ? colX[i] + widths[i] / 2
          : colX[i] + 2;
      doc.text(label, x, y + 5.4, { align: aligns[i] });
    });
    doc.setDrawColor(255);
    doc.setLineWidth(0.15);
    for (let i = 1; i < colX.length; i++)
      doc.line(colX[i], y, colX[i], y + TABLE_HEAD_H);
    return y + TABLE_HEAD_H;
  };

  const drawFooter = (pageNum: number, pageTotal: number) => {
    const fy = H - FOOTER_H;
    doc.setDrawColor(28, 65, 165);
    doc.setLineWidth(0.4);
    doc.line(M, fy, W - M, fy);
    doc.setTextColor(80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(
      "FED BUSINESS  ·  Fort Office, Mumbai - 400001  ·  support@fedbusiness.com  ·  1800-425-0000",
      W / 2,
      fy + 4.5,
      { align: "center" },
    );
    doc.setFontSize(6.8);
    doc.setTextColor(120);
    doc.text(
      "This is a computer-generated statement and does not require a signature.",
      M,
      fy + 9,
    );
    doc.text(`Page ${pageNum} of ${pageTotal}`, W - M, fy + 9, { align: "right" });
  };

  let pageNum = 0;
  const startPage = (first = false) => {
    if (!first) doc.addPage();
    pageNum += 1;
    if (pageNum === 1) {
      drawHeader();
      drawInfoBlock();
      const tilesY = HEADER_H + 4 + INFO_H + 4;
      drawTopSummary(tilesY);
      const tableY = tilesY + TOP_TILE_H + 4;
      return drawTableHeader(tableY);
    }
    drawCompactHeader(pageNum);
    const tableY = COMPACT_HEADER_H + 6;
    return drawTableHeader(tableY);
  };

  const drawRowBorders = (yBottom: number) => {
    doc.setDrawColor(220);
    doc.setLineWidth(0.15);
    doc.line(M, yBottom, M + innerW, yBottom);
    for (let i = 1; i < colX.length; i++)
      doc.line(colX[i], yBottom - ROW_H, colX[i], yBottom);
    doc.line(M, yBottom - ROW_H, M, yBottom);
    doc.line(M + innerW, yBottom - ROW_H, M + innerW, yBottom);
  };

  const numericCols = new Set([4, 5, 6]);
  const writeRow = (
    cells: string[],
    y0: number,
    opts?: { bold?: boolean; bg?: [number, number, number]; fg?: [number, number, number] },
  ) => {
    if (opts?.bg) {
      doc.setFillColor(opts.bg[0], opts.bg[1], opts.bg[2]);
      doc.rect(M, y0, innerW, ROW_H, "F");
    }
    doc.setTextColor(opts?.fg?.[0] ?? 20, opts?.fg?.[1] ?? 20, opts?.fg?.[2] ?? 20);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(8);
    cells.forEach((c, i) => {
      const isNum = numericCols.has(i);
      if (isNum) doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
      else doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
      const x =
        aligns[i] === "right"
          ? colX[i] + widths[i] - 3
          : aligns[i] === "center"
          ? colX[i] + widths[i] / 2
          : colX[i] + 2.5;
      const maxW = widths[i] - 5;
      const text = (doc.splitTextToSize(String(c ?? ""), maxW)[0] ?? "") as string;
      doc.text(text, x, y0 + 4.8, { align: aligns[i] });
    });
    drawRowBorders(y0 + ROW_H);
  };

  let y = startPage(true);

  // Opening balance row
  writeRow(
    ["", "Opening Balance", "", "", "", "", formatNumPdf(opening), "Cr"],
    y,
    { bold: true, bg: [248, 250, 253] },
  );
  y += ROW_H;

  ordered.forEach((t, i) => {
    if (y + ROW_H > limitY) y = startPage(false);
    const dateStr = formatDDMMYYYY(t.date);
    const desc = String(t.description || "").toUpperCase();
    const tranType =
      /UPI/.test(desc) ? "UPI"
      : /IMPS/.test(desc) ? "IMPS"
      : /NEFT/.test(desc) ? "NEFT"
      : /RTGS/.test(desc) ? "RTGS"
      : /ATM/.test(desc) ? "ATM"
      : "TFR";
    const tranId = String(t.transactionId || t.reference || t.id);
    const crDr = t.debit ? "Dr" : "Cr";
    writeRow(
      [
        dateStr,
        String(t.description || ""),
        tranId,
        tranType,
        t.debit ? formatNumPdf(t.debit) : "",
        t.credit ? formatNumPdf(t.credit) : "",
        formatNumPdf(t.balance),
        crDr,
      ],
      y,
      i % 2 === 1 ? { bg: [250, 251, 254] } : undefined,
    );
    y += ROW_H;
  });

  if (ordered.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("No transactions for the selected period.", M + 4, y + 6);
    y += ROW_H;
  }

  // Tail (closing + grand total + summary + disclaimer + end mark).
  // Do NOT force a new page for the whole tail — that creates an unwanted
  // "summary-only" Page 2. Each tail block below has its own per-piece
  // overflow check, so they flow onto Page 2 only when truly necessary.

  // Closing balance row
  writeRow(
    ["", "Closing Balance", "", "", "", "", formatNumPdf(closing), closing < 0 ? "Dr" : "Cr"],
    y,
    { bold: true, bg: [240, 244, 252] },
  );
  y += ROW_H;

  // Grand total row (filled brand color)
  doc.setFillColor(28, 65, 165);
  doc.rect(M, y, innerW, ROW_H, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  const gtCells = [
    "", "GRAND TOTAL", "", "",
    formatNumPdf(totalDebit),
    formatNumPdf(totalCredit),
    formatNumPdf(closing),
    closing < 0 ? "Dr" : "Cr",
  ];
  gtCells.forEach((c, i) => {
    const isNum = numericCols.has(i);
    doc.setFont(isNum ? "helvetica" : "helvetica", "bold");
    const x =
      aligns[i] === "right"
        ? colX[i] + widths[i] - 3
        : aligns[i] === "center"
        ? colX[i] + widths[i] / 2
        : colX[i] + 2.5;
    doc.text(String(c), x, y + 4.8, { align: aligns[i] });
  });
  drawRowBorders(y + ROW_H);
  y += ROW_H + 6;

  // Summary tiles
  if (y + 22 > limitY) y = startPage(false);
  const tileW = (innerW - 9) / 4;
  const tileH = 16;
  const tiles: [string, string][] = [
    ["Total Debits", formatINRPdf(totalDebit)],
    ["Total Credits", formatINRPdf(totalCredit)],
    ["Net Movement", formatINRPdf(totalCredit - totalDebit)],
    ["Closing Balance", formatINRPdf(closing)],
  ];
  tiles.forEach(([label, val], i) => {
    const tx = M + i * (tileW + 3);
    doc.setFillColor(248, 250, 253);
    doc.setDrawColor(210);
    doc.setLineWidth(0.2);
    doc.rect(tx, y, tileW, tileH, "FD");
    doc.setTextColor(110);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(label.toUpperCase(), tx + 3, y + 5.5);
    doc.setTextColor(28, 65, 165);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(val, tx + 3, y + 12.5);
  });
  y += tileH + 6;

  // Disclaimer
  if (y + 16 > limitY) y = startPage(false);
  doc.setTextColor(28, 65, 165);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Disclaimer", M, y);
  doc.setDrawColor(28, 65, 165);
  doc.setLineWidth(0.3);
  doc.line(M, y + 1, M + 22, y + 1);
  y += 5;
  doc.setTextColor(70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const disclaimer =
    "The contents of this statement will be considered correct unless any discrepancy is reported within 30 days of statement generation. " +
    "Account holders are advised to verify all entries and report any unauthorised transaction immediately. Keep your login credentials confidential.";
  const wrapped = doc.splitTextToSize(disclaimer, innerW) as string[];
  doc.text(wrapped, M, y);
  y += wrapped.length * 3.4 + 5;

  if (y + 10 > limitY) y = startPage(false);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(28, 65, 165);
  doc.text("*** END OF STATEMENT ***", W / 2, y + 3, { align: "center" });

  // Fill footers
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    drawFooter(p, total);
  }

  doc.save(`FedBusiness_Statement_${user.accountNumber}.pdf`);
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}