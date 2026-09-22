"use client";

import { useState } from "react";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function InvoiceActions({ invoiceNumber }: { invoiceNumber: string }) {
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const element = document.getElementById("invoice-content");
      if (!element) throw new Error("Invoice content not found");

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");

      // A4 in points: 595.28 x 841.89. Scale the captured image to fit
      // the page width, and add extra pages if the invoice is long.
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${invoiceNumber}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      toast("Couldn't generate the PDF. Please try again.", "error");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="no-print flex gap-2">
      <Button variant="secondary" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        Print Invoice
      </Button>
      <Button size="sm" onClick={handleDownload} loading={downloading}>
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
    </div>
  );
}