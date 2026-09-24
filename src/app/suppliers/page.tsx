"use client";

import React, { useState } from "react";
import {
  WalletCards,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Phone,
  DollarSign,
  History,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useStore } from "@/lib/storage/context";
import { SupplierCredit } from "@/types";
import { formatPKR, formatDate, daysSince } from "@/lib/utils";

export default function SupplierCreditPage() {
  const {
    supplierCredits,
    addSupplierCredit,
    recordSupplierPayment,
    deleteSupplierCredit,
  } = useStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Partial" | "Paid">("All");

  // New Credit Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierPhone: "",
    purchasedParts: "",
    quantity: 1,
    totalAmount: 0,
    purchaseDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  // Record Payment Modal
  const [paymentModalCredit, setPaymentModalCredit] = useState<SupplierCredit | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState<string>("Cash payment installment");

  // Payment History View Modal
  const [viewHistoryCredit, setViewHistoryCredit] = useState<SupplierCredit | null>(null);

  // Calculations
  const totalOutstanding = supplierCredits.reduce((acc, c) => acc + c.remainingBalance, 0);
  const overdueCredits = supplierCredits.filter(
    (c) => c.status !== "Paid" && daysSince(c.purchaseDate) >= 15
  );

  const handleCreateCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSupplierCredit({
      supplierName: formData.supplierName,
      supplierPhone: formData.supplierPhone,
      purchasedParts: formData.purchasedParts,
      quantity: Number(formData.quantity) || 1,
      totalAmount: Number(formData.totalAmount) || 0,
      purchaseDate: new Date(formData.purchaseDate).toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
    });
    setIsAddModalOpen(false);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalCredit) return;
    try {
      await recordSupplierPayment(
        paymentModalCredit.id,
        Number(paymentAmount),
        paymentNotes
      );
      setPaymentModalCredit(null);
      setPaymentAmount(0);
    } catch (err: any) {
      alert(err.message || "Failed to record payment.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier credit record?")) {
      await deleteSupplierCredit(id);
    }
  };

  const filteredCredits = supplierCredits.filter((c) => {
    const s = search.toLowerCase();
    const matchesSearch =
      c.supplierName.toLowerCase().includes(s) ||
      c.supplierPhone.includes(s) ||
      c.purchasedParts.toLowerCase().includes(s);

    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <WalletCards className="h-7 w-7 text-blue-600" />
            Supplier Credit Management (ادھار / کھاتہ)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Suppliers se udhaar par liya gaya maal, baqaya raqam (balance) aur installments ka hisaab.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} size="lg" className="font-bold shadow-sm">
          <Plus className="h-5 w-5 mr-1.5" />
          Add Credit Entry (نیا ادھار اندراج)
        </Button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Outstanding Udhaar
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatPKR(totalOutstanding)}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              Rs
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                15+ Days Overdue
              </div>
              <div className="text-2xl font-black text-amber-900 mt-1">
                {overdueCredits.length} Suppliers Due
              </div>
            </div>
            <Badge variant="danger" className="text-xs font-bold">
              Follow-up Priority
            </Badge>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Supplier Accounts
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {supplierCredits.length} Recorded
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              #
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="glass-card">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by supplier name, phone number, or purchased items..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start">
            {(["All", "Pending", "Partial", "Paid"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  statusFilter === st
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplier Credit Table */}
      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Supplier & Phone</th>
                <th className="py-3 px-3">Purchased Parts</th>
                <th className="py-3 px-3">Purchase Date</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-3 text-right">Paid Amount</th>
                <th className="py-3 px-3 text-right">Remaining Balance</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCredits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No supplier credit records found.
                  </td>
                </tr>
              ) : (
                filteredCredits.map((c) => {
                  const daysOld = daysSince(c.purchaseDate);
                  const is15DaysOverdue = c.status !== "Paid" && daysOld >= 15;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/80 transition ${
                        is15DaysOverdue ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="font-bold text-slate-900">{c.supplierName}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {c.supplierPhone}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 max-w-[240px]">
                        <div className="font-medium text-slate-800 truncate">
                          {c.purchasedParts}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Qty: {c.quantity} pieces
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-slate-700 font-medium">
                          {formatDate(c.purchaseDate)}
                        </div>
                        <div
                          className={`text-[10px] font-bold ${
                            is15DaysOverdue
                              ? "text-rose-600 animate-pulse"
                              : "text-slate-400"
                          }`}
                        >
                          {daysOld} days ago
                          {is15DaysOverdue && " • 15+ Days Due"}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-slate-800">
                        {formatPKR(c.totalAmount)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-semibold text-emerald-700">
                        {formatPKR(c.paidAmount)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-black text-rose-700 text-sm">
                        {formatPKR(c.remainingBalance)}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <Badge
                          variant={
                            c.status === "Paid"
                              ? "success"
                              : c.status === "Partial"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {c.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.status !== "Paid" && (
                            <Button
                              size="sm"
                              variant="primary"
                              className="h-7 text-xs px-2.5 font-bold"
                              onClick={() => {
                                setPaymentModalCredit(c);
                                setPaymentAmount(c.remainingBalance);
                              }}
                            >
                              Pay / ادا کریں
                            </Button>
                          )}

                          <button
                            onClick={() => setViewHistoryCredit(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Payment History"
                          >
                            <History className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* Add New Credit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Supplier Credit Purchase / ادھار خریداری کا اندراج"
        description="Record inventory parts purchased on credit from suppliers"
      >
        <form onSubmit={handleCreateCredit} className="space-y-3.5">
          <Input
            label="Supplier Name *"
            required
            value={formData.supplierName}
            onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
            placeholder="e.g. Sindh Spare Parts Saddar"
          />

          <Input
            label="Supplier Phone Number"
            value={formData.supplierPhone}
            onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
            placeholder="0321-XXXXXXX"
          />

          <Input
            label="Purchased Parts Description *"
            required
            value={formData.purchasedParts}
            onChange={(e) =>
              setFormData({ ...formData, purchasedParts: e.target.value })
            }
            placeholder="e.g. 25x CG125 Clutch Plates, 30x LED Headlights"
          />

          <div className="grid grid-cols-2 gap-3.5">
            <Input
              label="Total Quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: Number(e.target.value) })
              }
            />
            <Input
              label="Total Udhaar Amount (Rs.) *"
              type="number"
              required
              min="1"
              value={formData.totalAmount || ""}
              onChange={(e) =>
                setFormData({ ...formData, totalAmount: Number(e.target.value) })
              }
              placeholder="50000"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Input
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
            <Input
              label="Payment Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Credit Entry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Installment Modal */}
      <Modal
        isOpen={!!paymentModalCredit}
        onClose={() => setPaymentModalCredit(null)}
        title={`Record Payment: ${paymentModalCredit?.supplierName}`}
        description={`Remaining Balance: ${formatPKR(
          paymentModalCredit?.remainingBalance || 0
        )}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Input
            label="Installment Payment Amount (Rs.) *"
            type="number"
            required
            min="1"
            max={paymentModalCredit?.remainingBalance}
            value={paymentAmount || ""}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
            placeholder="Enter payment amount"
          />

          <Input
            label="Payment Notes / Method"
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="e.g. Cash payment / Bank transfer slip #1234"
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPaymentModalCredit(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payment History View Modal */}
      <Modal
        isOpen={!!viewHistoryCredit}
        onClose={() => setViewHistoryCredit(null)}
        title={`Payment History: ${viewHistoryCredit?.supplierName}`}
        description={`Total Udhaar: ${formatPKR(
          viewHistoryCredit?.totalAmount || 0
        )} • Paid: ${formatPKR(
          viewHistoryCredit?.paidAmount || 0
        )} • Remaining: ${formatPKR(viewHistoryCredit?.remainingBalance || 0)}`}
        maxWidth="lg"
      >
        <div className="space-y-3">
          {viewHistoryCredit?.paymentHistory &&
          viewHistoryCredit.paymentHistory.length > 0 ? (
            <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
              {viewHistoryCredit.paymentHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">{item.notes}</div>
                    <div className="text-[11px] text-slate-400">
                      {formatDate(item.paymentDate)}
                    </div>
                  </div>
                  <div className="font-black text-emerald-700 text-sm">
                    {formatPKR(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">
              No payments recorded yet for this entry.
            </p>
          )}

          <div className="flex justify-end pt-3">
            <Button variant="secondary" onClick={() => setViewHistoryCredit(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
