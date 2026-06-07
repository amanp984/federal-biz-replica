import jsPDF from "jspdf";
import type { User } from "./auth-store";
import { type Transaction, withRunningBalance, formatINR } from "./transactions-store";

/**
 * Print-ready account statement PDF modelled closely on the reference layout:
 * compact header band, two-column customer info grid, ruled transaction table
 * with Date / Value Date / Particulars / Tran Type / Tran ID / Cheque Details /
 * Withdrawals / Deposits / Balance / DR-CR, opening + closing balance rows,
 * grand total strip, abbreviations + disclaimer, and "Page X of Y" footer.
 */
export function downloadStatementPDF(user: User, txs: Transaction[], periodLabel?: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 8; // page margin

  const running = withRunningBalance(txs);
  const ordered = running.slice().reverse(); // oldest -> newest
  const opening = 0;
  const closing = running[0]?.balance ?? 0;
  const totalDebit = ordered.reduce((s, t) => s + (t.debit || 0), 0);
  const totalCredit = ordered.reduce((s, t) => s + (t.credit || 0), 0);

  const today = new Date();
  const period =
    periodLabel ??
    `01-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()} to ${String(
      today.getDate(),
    ).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

  // Column layout (mm) — matches reference order
  const innerW = W - 2 * M;
  const colW = [20, 18, 56, 14, 22, 22, 22, 22, 22, 12]; // sum ~230 will scale
  const sum = colW.reduce((a, b) => a + b, 0);
  const scale = innerW / sum;
  const widths = colW.map((w) => w * scale);
  const labels = ["Date", "Value Date", "Particulars", "Tran Type", "Tran ID", "Cheque Details", "Withdrawals", "Deposits", "Balance", "DR/CR"];
  const aligns: ("left" | "right" | "center")[] = ["left", "left", "left", "center", "left", "left", "right", "right", "right", "center"];
  const colX: number[] = [];
  { let x = M; for (const w of widths) { colX.push(x); x += w; } }

  const TABLE_TOP_HEADER_H = 8;
  const ROW_H = 6.2;
  const TOP_BAND_H = 14;
  const INFO_BLOCK_H = 56;
  const FOOTER_H = 10;
  const HEADER_TOTAL = TOP_BAND_H + 2 + INFO_BLOCK_H + TABLE_TOP_HEADER_H;
  const limitY = H - FOOTER_H - 4;

  const drawTopBand = () => {
    doc.setFillColor(28, 65, 165);
    doc.rect(0, 0, W, TOP_BAND_H, "F");
    doc.setFillColor(245, 158, 11);
    doc.rect(0, TOP_BAND_H, W, 1.2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("FED BUSINESS", M, 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("YOUR BUSINESS BANKING PARTNER", M, 12.5);
    doc.setFontSize(8);
    doc.text("Statement of Account", W - M, 7.5, { align: "right" });
    doc.setFontSize(7);
    doc.text("support@fedbusiness.com  |  1800-425-0000", W - M, 11.5, { align: "right" });
    doc.text(`Generated: ${today.toLocaleString("en-IN")}`, W - M, 14.5, { align: "right" });
  };

  const drawInfoBlock = () => {
    const top = TOP_BAND_H + 3;
    // Outer border
    doc.setDrawColor(180);
    doc.setLineWidth(0.25);
    doc.rect(M, top, innerW, INFO_BLOCK_H);
    // Vertical split
    doc.line(M + innerW / 2, top, M + innerW / 2, top + INFO_BLOCK_H - 7);
    // Period band at bottom of info block
    doc.setFillColor(240, 244, 252);
    doc.rect(M, top + INFO_BLOCK_H - 7, innerW, 7, "F");
    doc.setDrawColor(180);
    doc.line(M, top + INFO_BLOCK_H - 7, M + innerW, top + INFO_BLOCK_H - 7);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(8);
    const left = [
      ["Name", user.customerName],
      ["Communication Address", user.address],
      ["Address Last Updated On", "29/07/2025"],
      ["Regd. Mobile Number", user.mobile],
      ["Email ID", user.email],
      ["Type of Account", `${user.accountType} Account`],
      ["Scheme", "CA BUSINESS"],
      ["IFSC", user.ifsc],
      ["MICR Code", "400007777"],
      ["SWIFT Code", "FDRLINBBIBD"],
      ["Effective Available Balance", formatINR(closing)],
    ];
    const right = [
      ["Branch Name", user.branch],
      ["Branch Sol ID", "1391"],
      ["", ""],
      ["Account Number", user.accountNumber],
      ["Customer ID", user.customerId],
      ["Account Open Date", "14/03/2025"],
      ["Account Status", "ACTIVE"],
      ["Mode of Operation", "SINGLE"],
      ["Joint Holders", "NIL"],
      ["Nomination", "NOT REGISTERED"],
      ["Currency", "INR"],
    ];
    const rowH = (INFO_BLOCK_H - 7) / left.length;
    const writeCol = (data: string[][], xLabel: number, xValue: number) => {
      data.forEach(([k, v], i) => {
        const y = top + (i + 1) * rowH - 1.5;
        if (!k && !v) return;
        doc.setFont("helvetica", "bold");
        doc.text(k, xLabel, y);
        doc.setFont("helvetica", "normal");
        const maxW = innerW / 2 - (xValue - xLabel) - 3;
        const lines = doc.splitTextToSize(String(v ?? ""), maxW) as string[];
        doc.text(lines[0] ?? "", xValue, y);
      });
    };
    writeCol(left, M + 2, M + 38);
    writeCol(right, M + innerW / 2 + 2, M + innerW / 2 + 38);

    // Period strip
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(28, 65, 165);
    doc.text(
      `Statement of Account for the period ${period}`,
      M + innerW / 2,
      top + INFO_BLOCK_H - 2.2,
      { align: "center" },
    );
  };

  const drawTableHeader = (y: number) => {
    doc.setFillColor(28, 65, 165);
    doc.rect(M, y, innerW, TABLE_TOP_HEADER_H, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    labels.forEach((label, i) => {
      const x = aligns[i] === "right" ? colX[i] + widths[i] - 1.5
        : aligns[i] === "center" ? colX[i] + widths[i] / 2
        : colX[i] + 1.5;
      doc.text(label, x, y + 5.2, { align: aligns[i] });
    });
    // Column separators (header)
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.15);
    for (let i = 1; i < colX.length; i++) doc.line(colX[i], y, colX[i], y + TABLE_TOP_HEADER_H);
    doc.setDrawColor(180);
    doc.setLineWidth(0.25);
    return y + TABLE_TOP_HEADER_H;
  };

  const drawFooterBand = () => {
    const fy = H - FOOTER_H;
    doc.setDrawColor(28, 65, 165);
    doc.setLineWidth(0.4);
    doc.line(M, fy, W - M, fy);
    doc.setTextColor(80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      "FED BUSINESS Corporate Office: Fort Office, Mumbai - 400001  |  Email: support@fedbusiness.com  |  Helpline: 1800-425-0000",
      W / 2, fy + 4, { align: "center" },
    );
    doc.setFontSize(6.5);
    doc.setTextColor(120);
    doc.text("This is a computer-generated statement and does not require a signature.", M, fy + 8);
    // Page X of Y filled in after all pages rendered
  };

  const startPage = (first = false) => {
    if (!first) doc.addPage();
    drawTopBand();
    drawInfoBlock();
    const tableY = TOP_BAND_H + 3 + INFO_BLOCK_H + 2;
    drawFooterBand();
    return drawTableHeader(tableY);
  };

  const drawRowBorders = (y: number) => {
    doc.setDrawColor(210);
    doc.setLineWidth(0.15);
    // bottom line
    doc.line(M, y, M + innerW, y);
    // vertical separators
    for (let i = 1; i < colX.length; i++) doc.line(colX[i], y - ROW_H, colX[i], y);
    // outer rect
    doc.line(M, y - ROW_H, M, y);
    doc.line(M + innerW, y - ROW_H, M + innerW, y);
  };

  let y = startPage(true);

  // Opening balance row
  const writeRow = (cells: string[], y0: number, opts?: { bold?: boolean; bg?: [number, number, number] }) => {
    if (opts?.bg) {
      doc.setFillColor(...opts.bg);
      doc.rect(M, y0, innerW, ROW_H, "F");
    }
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(7);
    cells.forEach((c, i) => {
      const x = aligns[i] === "right" ? colX[i] + widths[i] - 1.5
        : aligns[i] === "center" ? colX[i] + widths[i] / 2
        : colX[i] + 1.5;
      const maxW = widths[i] - 3;
      const text = doc.splitTextToSize(String(c ?? ""), maxW)[0] ?? "";
      doc.text(text, x, y0 + 4.2, { align: aligns[i] });
    });
    drawRowBorders(y0 + ROW_H);
  };

  writeRow(["", "", "Opening Balance", "", "", "", "", "", formatINR(opening), "Cr"], y, { bold: true, bg: [248, 250, 253] });
  y += ROW_H;

  ordered.forEach((t, i) => {
    if (y + ROW_H > limitY) {
      y = startPage(false);
    }
    const d = new Date(t.date);
    const dateStr = d.toLocaleDateString("en-GB").replace(/\//g, "-").toUpperCase();
    const tranType = (t.type || "TFR").toString().slice(0, 4).toUpperCase();
    const tranId = (t.transactionId || t.reference || t.id).toString().slice(0, 12);
    const particulars = String(t.description || "").slice(0, 60);
    const crDr = t.debit ? "Dr" : "Cr";
    writeRow(
      [
        dateStr, dateStr, particulars, tranType, tranId, "",
        t.debit ? formatINR(t.debit) : "",
        t.credit ? formatINR(t.credit) : "",
        formatINR(t.balance), crDr,
      ],
      y,
      i % 2 === 1 ? { bg: [250, 251, 254] } : undefined,
    );
    y += ROW_H;
  });

  if (ordered.length === 0) {
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text("No transactions for the selected period.", M + 3, y + 5);
    y += ROW_H;
  }

  // GRAND TOTAL — needs 3 rows + abbreviations + disclaimer + end mark
  const TAIL_H = 6 + 6 + 18 + 18 + 8;
  if (y + TAIL_H > limitY) y = startPage(false);

  // Closing balance row
  writeRow(["", "", "Closing Balance", "", "", "", "", "", formatINR(closing), closing < 0 ? "Dr" : "Cr"], y, { bold: true, bg: [240, 244, 252] });
  y += ROW_H;

  // Grand total
  writeRow(
    ["", "", "GRAND TOTAL", "", "", "", formatINR(totalDebit), formatINR(totalCredit), formatINR(closing), closing < 0 ? "Dr" : "Cr"],
    y,
    { bold: true, bg: [28, 65, 165] },
  );
  // overwrite text color for grand total
  doc.setFillColor(28, 65, 165);
  doc.rect(M, y, innerW, ROW_H, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  const gtCells = ["", "", "GRAND TOTAL", "", "", "", formatINR(totalDebit), formatINR(totalCredit), formatINR(closing), closing < 0 ? "Dr" : "Cr"];
  gtCells.forEach((c, i) => {
    const x = aligns[i] === "right" ? colX[i] + widths[i] - 1.5
      : aligns[i] === "center" ? colX[i] + widths[i] / 2
      : colX[i] + 1.5;
    doc.text(String(c), x, y + 4.4, { align: aligns[i] });
  });
  drawRowBorders(y + ROW_H);
  y += ROW_H + 3;

  // Abbreviations
  if (y + 22 > limitY) y = startPage(false);
  doc.setTextColor(28, 65, 165);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Abbreviations", M, y);
  doc.setDrawColor(28, 65, 165);
  doc.setLineWidth(0.3);
  doc.line(M, y + 1, M + 28, y + 1);
  y += 4;
  doc.setTextColor(60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const abbr = [
    "NEFT — National Electronic Funds Transfer",
    "RTGS — Real Time Gross Settlement",
    "IMPS — Immediate Payment Service",
    "UPI — Unified Payments Interface",
    "FT — Fund Transfer",
    "TFR — Transfer",
    "DR — Debit / Withdrawal",
    "CR — Credit / Deposit",
  ];
  abbr.forEach((line, i) => {
    doc.text(line, M + (i % 2) * (innerW / 2), y + Math.floor(i / 2) * 3.6);
  });
  y += Math.ceil(abbr.length / 2) * 3.6 + 4;

  // Disclaimer
  if (y + 18 > limitY) y = startPage(false);
  doc.setTextColor(28, 65, 165);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Disclaimer", M, y);
  doc.line(M, y + 1, M + 22, y + 1);
  y += 4;
  doc.setTextColor(70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const disclaimer =
    "The contents of this statement will be considered correct unless any discrepancy is reported within 30 days of statement generation. " +
    "Account holders are advised to verify all entries and report any unauthorized transactions immediately. Keep your login credentials " +
    "confidential and use Mobile Banking for modifications to beneficiaries, limits, or contact details.";
  const wrapped = doc.splitTextToSize(disclaimer, innerW) as string[];
  doc.text(wrapped, M, y);
  y += wrapped.length * 3.2 + 5;

  // End of statement
  if (y + 8 > limitY) y = startPage(false);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(28, 65, 165);
  doc.text("*** END OF STATEMENT ***", W / 2, y + 2, { align: "center" });

  // Fill Page X of Y across all pages
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(`Page ${p} of ${total}`, W - M, H - FOOTER_H + 8, { align: "right" });
  }

  doc.save(`FedBusiness_Statement_${user.accountNumber}.pdf`);
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}