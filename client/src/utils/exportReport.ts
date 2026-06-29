import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

export function exportToExcel(rows: Record<string, unknown>[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToPdf(columns: string[], rows: (string | number)[][], title: string, filename: string) {
  const doc = new jsPDF();
  doc.text(title, 14, 16);
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 22,
  });
  doc.save(`${filename}.pdf`);
}
