import jsPDF from "jspdf";
import type { User } from "./auth-store";
import { type Transaction, withRunningBalance, formatINR } from "./transactions-store";

/**
 * Professional bank statement PDF — modeled after the standard
 * Federal Bank account statement layout: header band, customer + account
 * info blocks, ruled transaction table with Date / Value Date / Particulars /
 * Tran Type / Tran ID / Withdrawals / Deposits / Balance, grand total,
 * abbreviations + disclaimer footer, and per-page numbering.
 */
export function downloadStatementPDF(user: User, txs: Transaction[], periodLabel?: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 10; // page margin

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

  // Column layout (mm)
  const cols = {
    date:   { x: M,       w: 22, label: "Tran Date" },
    vdate:  { x: M + 22,  w: 20, label: "Value Date" },
    desc:   { x: M + 42,  w: 70, label: "Particulars" },
    type:   { x: M + 112, w: 16, label: "Tran Type" },
    tid:    { x: M + 128, w: 22, label: "Tran ID" },
    dr:     { x: M + 150, w: 18, label: "Withdrawals" },
    cr:     { x: M + 168, w: 18, label: "Deposits" },
    bal:    { x: M + 186, w: W - (M + 186) - M, label: "Balance" },
  };

  let page = 1;

  const drawHeader = () => {
    // Top blue band
    doc.setFillColor(28, 65, 165);
    doc.rect(0, 0, W, 18, "F");
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 18, W, 1.4, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("FED BUSINESS", M, 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Account Statement", W - M, 8, { align: "right" });
    doc.setFontSize(8);
    doc.text(`Statement Period: ${period}`, W - M, 13, { align: "right" });

    // Customer / Account info grid
    let y = 26;
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);

    const leftLabelX = M;
    const leftValueX = M + 32;
    const rightLabelX = W / 2 + 4;
    const rightValueX = W / 2 + 38;

    const row = (
      lLabel: string, lValue: string,
      rLabel: string, rValue: string,
    ) => {
      doc.setFont("helvetica", "bold");
      doc.text(lLabel, leftLabelX, y);
      doc.text(rLabel, rightLabelX, y);
      doc.setFont("helvetica", "normal");
      doc.text(lValue, leftValueX, y);
      doc.text(rValue, rightValueX, y);
      y += 5;
    };

    row("Account Holder", user.customerName, "Customer ID", user.customerId);
    row("Account No.",    user.accountNumber, "CIF",         user.cif);
    row("IFSC Code",      user.ifsc,          "Branch",      user.branch);
    row("Account Type",   user.accountType,   "Currency",    "INR");
    row("Email",          user.email,         "Mobile",      user.mobile);
    row("Statement Period", period,           "Generated",   today.toLocaleString("en-IN"));

    y += 2;
    // Opening/closing strip
    doc.setFillColor(240, 244, 252);
    doc.rect(M, y, W - 2 * M, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(28, 65, 165);
    doc.text(`Opening Balance: ${formatINR(opening)}`, M + 2, y + 5.4);
    doc.text(`Closing Balance: ${formatINR(closing)}`, W - M - 2, y + 5.4, { align: "right" });
    y += 12;

    // Table header
    doc.setFillColor(28, 65, 165);
    doc.setTextColor(255, 255, 255);
    doc.rect(M, y, W - 2 * M, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    (Object.values(cols)).forEach((c) => {
      const isAmt = c.label === "Withdrawals" || c.label === "Deposits" || c.label === "Balance";
      doc.text(c.label, isAmt ? c.x + c.w - 1 : c.x + 1, y + 4.8, { align: isAmt ? "right" : "left" });
    });
    y += 7;
    return y;
  };

  const drawFooter = () => {
    const footerY = H - 14;
    doc.setDrawColor(220);
    doc.line(M, footerY - 2, W - M, footerY - 2);
    doc.setTextColor(110);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      "This is a computer-generated statement and does not require a signature.",
      M, footerY + 2,
    );
    doc.text(`Page ${page}`, W - M, footerY + 2, { align: "right" });
    doc.setFontSize(6.5);
    doc.text(
      "FED BUSINESS Registered Office | For queries: support@fedbusiness.com",
      W / 2, footerY + 6, { align: "center" },
    );
  };

  let y = drawHeader();
  drawFooter();

  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  const rowH = 6;
  const limitY = H - 40; // leaves room for totals + footer

  const renderRow = (t: typeof ordered[number], i: number) => {
    if (y + rowH > limitY) {
      page += 1;
      doc.addPage();
      y = drawHeader();
      drawFooter();
      doc.setTextColor(20, 20, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
    }

    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 253);
      doc.rect(M, y, W - 2 * M, rowH, "F");
    }

    const d = new Date(t.date);
    const dateStr = d.toLocaleDateString("en-GB"); // DD/MM/YYYY
    const tranType = t.debit ? "DR" : "CR";
    const tranId = (t.transactionId || t.reference || t.id).toString().slice(0, 12);
    const particulars = String(t.description || "").slice(0, 48);

    const yT = y + 4;
    doc.text(dateStr, cols.date.x + 1, yT);
    doc.text(dateStr, cols.vdate.x + 1, yT);
    doc.text(particulars, cols.desc.x + 1, yT);
    doc.text(tranType, cols.type.x + 1, yT);
    doc.text(tranId, cols.tid.x + 1, yT);
    doc.text(t.debit ? formatINR(t.debit) : "-", cols.dr.x + cols.dr.w - 1, yT, { align: "right" });
    doc.text(t.credit ? formatINR(t.credit) : "-", cols.cr.x + cols.cr.w - 1, yT, { align: "right" });
    doc.text(`${formatINR(t.balance)} ${tranType}`, cols.bal.x + cols.bal.w - 1, yT, { align: "right" });

    y += rowH;
  };

  if (ordered.length === 0) {
    doc.text("No transactions for the selected period.", M + 2, y + 5);
    y += 8;
  } else {
    ordered.forEach(renderRow);
  }

  // Grand total strip
  if (y + 12 > limitY) {
    page += 1;
    doc.addPage();
    y = drawHeader();
    drawFooter();
  }
  doc.setFillColor(240, 244, 252);
  doc.rect(M, y, W - 2 * M, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(28, 65, 165);
  doc.text("GRAND TOTAL", M + 2, y + 5.4);
  doc.text(formatINR(totalDebit), cols.dr.x + cols.dr.w - 1, y + 5.4, { align: "right" });
  doc.text(formatINR(totalCredit), cols.cr.x + cols.cr.w - 1, y + 5.4, { align: "right" });
  doc.text(formatINR(closing), cols.bal.x + cols.bal.w - 1, y + 5.4, { align: "right" });
  y += 12;

  // Abbreviations
  doc.setTextColor(60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Abbreviations:", M, y);
  doc.setFont("helvetica", "normal");
  y += 4;
  const abbr = [
    "NEFT — National Electronic Funds Transfer",
    "RTGS — Real Time Gross Settlement",
    "IMPS — Immediate Payment Service",
    "UPI — Unified Payments Interface",
    "DR — Debit / Withdrawal",
    "CR — Credit / Deposit",
    "UTR — Unique Transaction Reference",
    "REF — Reference Number",
  ];
  abbr.forEach((line, i) => {
    doc.text(line, M + (i % 2) * (W / 2 - M), y + Math.floor(i / 2) * 3.5);
  });
  y += Math.ceil(abbr.length / 2) * 3.5 + 3;

  // Disclaimer
  doc.setFont("helvetica", "bold");
  doc.text("Disclaimer:", M, y);
  doc.setFont("helvetica", "normal");
  y += 3.5;
  const disclaimer =
    "The contents of this statement will be considered correct unless the account holder reports any discrepancy " +
    "within 30 days of statement generation. Please verify all entries and report unauthorized transactions immediately. " +
    "Account holders are advised to keep their login credentials confidential and use Mobile Banking for any modifications.";
  doc.text(doc.splitTextToSize(disclaimer, W - 2 * M), M, y);
  y += 14;

  // Statement ending
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 65, 165);
  doc.text("*** END OF STATEMENT ***", W / 2, y + 3, { align: "center" });

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