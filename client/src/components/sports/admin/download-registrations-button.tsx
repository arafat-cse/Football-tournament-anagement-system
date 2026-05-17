"use client";

import React from "react";
import { FileSpreadsheet } from "lucide-react";
import type { Registration } from "@/data/tournament/types";

export function DownloadRegistrationsButton({ registrations }: { registrations: Registration[] }) {
  const downloadExcel = () => {
    // 1. Define CSV headers
    const headers = [
      "SL",
      "Name",
      "Phone",
      "Email",
      "Age",
      "Position/Role",
      "Address",
      "Experience",
      "Base Price (TK)",
      "Payment Status",
      "Registration Status",
      "Payment Method",
      "Transaction ID",
      "Amount Paid (TK)",
      "Registration Date"
    ];

    // 2. Format row values
    const rows = registrations.map((item, index) => [
      String(index + 1),
      item.name || "",
      item.phone || "",
      item.email || "",
      item.age ? String(item.age) : "-",
      item.role || "",
      (item.address || "").replace(/"/g, '""'), // Escape quotes for CSV
      (item.experience || "").replace(/"/g, '""'),
      item.basePrice ? String(item.basePrice) : "0",
      item.paymentStatus || "pending",
      item.registrationStatus || "pending",
      item.paymentMethod || "",
      item.transactionId || "",
      item.amount ? String(item.amount) : "0",
      item.createdAt ? new Date(item.createdAt).toLocaleString("en-US") : ""
    ]);

    // 3. Assemble CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    // 4. Add UTF-8 BOM to support Unicode (Bengali text, symbols) correctly in MS Excel
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // 5. Create download link
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `registrations-export-${new Date().toISOString().split("T")[0]}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={downloadExcel}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
    >
      <FileSpreadsheet className="size-4" />
      Download Excel
    </button>
  );
}
