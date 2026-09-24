"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Printer,
  Calendar,
  Eye,
  Trash2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ReceiptModal } from "@/components/pos/receipt-modal";
import { useStore } from "@/lib/storage/context";
import { Bill } from "@/types";
import { formatPKR, formatDate, formatDateTime } from "@/lib/utils";

export default function BillHistoryPage() {
  const { bills, cancelBill } = useStore();

  const [search, setSearch] = useState("");
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<Bill | null>(null);
  const [selectedBillForView, setSelectedBillForView] = useState<Bill | null>(null);
  const [billToCancel, setBillToCancel] = useState<Bill | null>(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState("");

  const handleConfirmCancel = async () => {
    if (!billToCancel) return;
    try {
      await cancelBill(billToCancel.id);
      setCancelSuccessMsg(
        `Bill ${billToCancel.billNumber} cancelled successfully! Stock has been restored back to inventory automatically.`
      );
      setBillToCancel(null);
      setTimeout(() => setCancelSuccessMsg(""), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to cancel bill.");
    }
  };

  const filteredBills = bills.filter((b) => {
    const s = search.toLowerCase();
    return (
      b.billNumber.toLowerCase().includes(s) ||
      b.customerName.toLowerCase().includes(s) ||
      (b.customerPhone && b.customerPhone.includes(s)) ||
      (b.bikeRegNumber && b.bikeRegNumber.toLowerCase().includes(s)) ||
      b.createdAt.includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="h-7 w-7 text-blue-600" />
            Bill History & Invoices / پرانے بلز کا ریکارڈ
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Pehle se bane huway bills check karein, re-print karein ya galat bill cancel karke stock restore karein.
          </p>
        </div>
      </div>

      {/* Stock Restored Success Message Banner */}
      {cancelSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3 shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{cancelSuccessMsg}</span>
        </div>
      )}

      {/* Search Input */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Bill # (e.g. SK-1001), Customer name, Phone, or Bike reg number..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Bill #</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Customer Details</th>
                <th className="py-3 px-3">Motorcycle</th>
                <th className="py-3 px-3 text-center">Items Count</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No bills match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const isCancelled = bill.status === "Cancelled";

                  return (
                    <tr
                      key={bill.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isCancelled ? "bg-rose-50/30 opacity-70" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-black text-blue-700 font-mono">
                        {bill.billNumber}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {formatDateTime(bill.createdAt)}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">
                          {bill.customerName}
                        </div>
                        {bill.customerPhone && (
                          <div className="text-[11px] font-mono text-slate-400">
                            {bill.customerPhone}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-slate-700">
                        <div>{bill.bikeModel || "-"}</div>
                        {bill.bikeRegNumber && (
                          <div className="text-[10px] font-mono font-bold text-slate-500">
                            {bill.bikeRegNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                        <Badge variant="outline">{bill.items.length} parts</Badge>
                      </td>

                      <td className="py-3.5 px-3 text-right font-black text-slate-900 text-sm">
                        {formatPKR(bill.grandTotal)}
                        {bill.discount > 0 && (
                          <div className="text-[10px] text-emerald-600 font-normal">
                            Discount: {formatPKR(bill.discount)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <Badge variant={isCancelled ? "danger" : "success"}>
                          {bill.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBillForView(bill)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="View Full Bill Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setSelectedBillForPrint(bill)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Print / Re-print Receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </button>

                          {!isCancelled && (
                            <button
                              onClick={() => setBillToCancel(bill)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Cancel Bill & Restore Stock"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bill Details Modal */}
      <Modal
        isOpen={!!selectedBillForView}
        onClose={() => setSelectedBillForView(null)}
        title={`Bill Details: ${selectedBillForView?.billNumber}`}
        description={`Created on ${formatDateTime(selectedBillForView?.createdAt || "")}`}
        maxWidth="2xl"
      >
        {selectedBillForView && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-500">Customer: </span>
                <span className="font-bold text-slate-900">
                  {selectedBillForView.customerName}
                </span>
                {selectedBillForView.customerPhone && (
                  <div className="text-slate-500">
                    Phone: {selectedBillForView.customerPhone}
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-500">Motorcycle: </span>
                <span className="font-bold text-slate-900">
                  {selectedBillForView.bikeModel || "Not specified"}
                </span>
                {selectedBillForView.bikeRegNumber && (
                  <div className="font-mono font-bold text-slate-600">
                    Reg: {selectedBillForView.bikeRegNumber}
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 border-b">
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedBillForView.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-semibold text-slate-800">
                        {item.partName}
                      </td>
                      <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="p-2.5 text-right text-slate-600">
                        {formatPKR(item.unitPrice)}
                      </td>
                      <td className="p-2.5 text-right font-black text-slate-900">
                        {formatPKR(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-baseline pt-2 text-xs border-t">
              <span className="text-slate-600">Payment Method:</span>
              <span className="font-bold text-slate-800">
                {selectedBillForView.paymentMethod}
              </span>
            </div>

            <div className="flex justify-between items-baseline text-base font-black text-slate-900">
              <span>Grand Total:</span>
              <span className="text-blue-700 text-lg">
                {formatPKR(selectedBillForView.grandTotal)}
              </span>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t">
              <Button
                variant="secondary"
                onClick={() => setSelectedBillForView(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedBillForPrint(selectedBillForView);
                  setSelectedBillForView(null);
                }}
              >
                <Printer className="h-4 w-4 mr-1.5" />
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Bill Confirmation Modal (Restores Stock) */}
      <Modal
        isOpen={!!billToCancel}
        onClose={() => setBillToCancel(null)}
        title="Cancel Bill & Restore Stock / بل کینسل کریں"
        description="Are you sure you want to cancel this bill? The inventory stock will automatically be returned."
        maxWidth="md"
      >
        {billToCancel && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
                <AlertTriangle className="h-4 w-4" />
                Stock Restoration Notice
              </div>
              <p>
                Yeh bill cancel karne se is ke tamaam items ({billToCancel.items.length}{" "}
                parts) wapis shop stock mein add kar diye jayenge aur customer ka lifetime spending record bhi adjust ho jayega.
              </p>
              <div className="pt-1 font-mono font-bold">
                Bill #: {billToCancel.billNumber} • Amount: {formatPKR(billToCancel.grandTotal)}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setBillToCancel(null)}>
                No, Keep Bill
              </Button>
              <Button variant="danger" onClick={handleConfirmCancel}>
                Yes, Cancel & Restore Stock
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Print Receipt Modal */}
      <ReceiptModal
        bill={selectedBillForPrint}
        isOpen={!!selectedBillForPrint}
        onClose={() => setSelectedBillForPrint(null)}
      />
    </div>
  );
}
