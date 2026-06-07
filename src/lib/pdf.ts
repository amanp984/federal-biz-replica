import jsPDF from "jspdf";
import type { User } from "./auth-store";
import { type Transaction, withRunningBalance, formatINR } from "./transactions-store";

export function downloadStatementPDF(user: User, txs: Transaction[]) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(28, 65, 165);
  doc.rect(0, 0, w, 22, "F");
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 22, w, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FED BUSINESS", 14, 14);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("FED BUSINESS — Account Statement", w - 14, 14, { align: "right" });

  // Customer block
  doc.setTextColor(20, 20, 20);
  let y = 32;
  const line = (k: string, v: string) => { doc.setFont("helvetica","bold"); doc.text(k, 14, y); doc.setFont("helvetica","normal"); doc.text(v, 55, y); y += 6; };
  line("Customer:", user.customerName);
  line("Customer ID:", user.customerId);
  line("Account No:", user.accountNumber);
  line("IFSC:", user.ifsc);
  line("Office:", user.branch);
  line("Generated:", new Date().toLocaleString("en-IN"));

  const running = withRunningBalance(txs);
  const opening = 0;
  const closing = running[0]?.balance ?? 0;

  y += 4;
  doc.setFont("helvetica","bold");
  doc.text(`Opening Balance: ${formatINR(opening)}`, 14, y);
  doc.text(`Closing Balance: ${formatINR(closing)}`, w - 14, y, { align: "right" });
  y += 6;

  // Table header
  doc.setFillColor(28, 65, 165);
  doc.setTextColor(255,255,255);
  doc.rect(14, y, w - 28, 8, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(9);
  doc.text("Date", 16, y + 5.5);
  doc.text("Description", 42, y + 5.5);
  doc.text("Debit", w - 80, y + 5.5, { align: "right" });
  doc.text("Credit", w - 50, y + 5.5, { align: "right" });
  doc.text("Balance", w - 16, y + 5.5, { align: "right" });
  y += 10;

  doc.setTextColor(20,20,20);
  doc.setFont("helvetica","normal");

  if (running.length === 0) {
    doc.text("No transactions for the selected period.", 14, y + 4);
  } else {
    running.slice().reverse().forEach((t) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(new Date(t.date).toLocaleDateString("en-IN"), 16, y);
      doc.text(String(t.description).slice(0, 48), 42, y);
      doc.text(t.debit ? formatINR(t.debit) : "-", w - 80, y, { align: "right" });
      doc.text(t.credit ? formatINR(t.credit) : "-", w - 50, y, { align: "right" });
      doc.text(formatINR(t.balance), w - 16, y, { align: "right" });
      y += 6;
    });
  }

  doc.setFontSize(8); doc.setTextColor(110);
  doc.text("This is a computer-generated statement and does not require a signature.", 14, 290);
  doc.save(`FedBiz_Statement_${user.accountNumber}.pdf`);
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}