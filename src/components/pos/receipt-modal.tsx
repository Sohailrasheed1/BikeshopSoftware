"use client";

import React, { useState } from "react";
import { Bill } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Printer, FileText, CheckCircle2 } from "lucide-react";
import { formatPKR, formatDateTime } from "@/lib/utils";

interface ReceiptModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ bill, isOpen, onClose }: ReceiptModalProps) {
  const [copyType, setCopyType] = useState<"customer" | "shop">("customer");
  const [format, setFormat] = useState<"thermal" | "standard">("thermal");

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bill Parchi Print Karein"
      description="Thermal 80mm ya Standard A4 printer se parchi print karein"
      maxWidth={format === "thermal" ? "md" : "2xl"}
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-200/80 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Copy:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setCopyType("customer")}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  copyType === "customer"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Gahak Copy
              </button>
              <button
                type="button"
                onClick={() => setCopyType("shop")}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  copyType === "shop"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Dukan Copy
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Format:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setFormat("thermal")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  format === "thermal"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Thermal 80mm
              </button>
              <button
                type="button"
                onClick={() => setFormat("standard")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  format === "standard"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Standard A4/A5
              </button>
            </div>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div
          id="printable-area"
          className={`printable-receipt mx-auto bg-white p-6 shadow-sm border border-slate-200 text-slate-900 ${
            format === "thermal"
              ? "max-w-[340px] rounded-lg text-xs leading-tight font-mono"
              : "w-full rounded-xl text-sm"
          }`}
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h1 className="text-lg font-black tracking-tight uppercase">
              SKANDER SPARE PARTS
            </h1>
            <p className="text-[11px] font-medium text-slate-600">
              Motorcycle Spare Parts & Accessories
            </p>
            <p className="text-[10px] text-slate-500">
              Shop #12, Akbar Road, Saddar, Karachi
            </p>
            <p className="text-[10px] text-slate-500 font-semibold">
              Tel: 0300-1234567 | 0321-9876543
            </p>

            <div className="mt-2 inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-300">
              {copyType === "customer" ? "Customer Copy" : "Shop / Accounts Copy"}
            </div>
          </div>

          {/* Bill Meta */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Bill No:</span>
              <span className="font-bold text-slate-900">{bill.billNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-medium text-slate-800">
                {formatDateTime(bill.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-900">
                {bill.customerName || "Walk-in Customer"}
              </span>
            </div>
            {bill.customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="text-slate-800">{bill.customerPhone}</span>
              </div>
            )}
            {(bill.bikeRegNumber || bill.bikeModel) && (
              <div className="flex justify-between">
                <span className="text-slate-500">Bike Details:</span>
                <span className="font-semibold text-slate-900">
                  {[bill.bikeModel, bill.bikeRegNumber].filter(Boolean).join(" - ")}
                </span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-3">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-300 text-[10px] uppercase font-bold text-slate-600">
                  <th className="py-1">Item / Description</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Rate</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {bill.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 pr-1">
                      <div className="font-semibold text-slate-800 leading-snug">
                        {item.partName}
                      </div>
                      <div className="text-[9px] text-slate-400">{item.category}</div>
                    </td>
                    <td className="py-1.5 text-center font-bold text-slate-800">
                      {item.quantity}
                    </td>
                    <td className="py-1.5 text-right text-slate-600">
                      {item.unitPrice}
                    </td>
                    <td className="py-1.5 text-right font-bold text-slate-900">
                      {item.totalPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatPKR(bill.subtotal)}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-{formatPKR(bill.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>Net Grand Total:</span>
              <span>{formatPKR(bill.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 pt-0.5">
              <span>Payment Mode:</span>
              <span className="font-bold text-slate-800">{bill.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Amount Paid:</span>
              <span className="font-bold text-emerald-700">{formatPKR(bill.paidAmount)}</span>
            </div>
          </div>

          {/* Urdu / English Note */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center space-y-1 text-[10px] text-slate-500">
            <p className="font-semibold text-slate-700">
              بیچا ہوا مال واپس یا تبدیل نہیں ہوگا
            </p>
            <p>Goods once sold will not be returned or exchanged without bill.</p>
            <p className="font-bold text-slate-800 pt-1">
              Thank You for Your Business! / شکریہ
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 no-print">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint} className="gap-2 font-bold shadow-md">
            <Printer className="h-4 w-4" />
            Print Receipt (پرنٹ کریں)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
