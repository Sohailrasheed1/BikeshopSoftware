"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Bike,
  Phone,
  MapPin,
  Calendar,
  Receipt,
  Edit,
  Trash2,
  Eye,
  History,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useStore } from "@/lib/storage/context";
import { Customer, Bill } from "@/types";
import { formatPKR, formatDate, formatDateTime } from "@/lib/utils";

export default function CustomersPage() {
  const { customers, bills, addCustomer, updateCustomer, deleteCustomer } = useStore();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Customer History Modal
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bikeRegNumber: "",
    bikeModel: "Honda CD 70",
    address: "",
    notes: "",
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      phone: "",
      bikeRegNumber: "",
      bikeModel: "Honda CD 70",
      address: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      bikeRegNumber: c.bikeRegNumber || "",
      bikeModel: c.bikeModel || "Honda CD 70",
      address: c.address || "",
      notes: c.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, formData);
    } else {
      await addCustomer(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer record?")) {
      await deleteCustomer(id);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.bikeRegNumber && c.bikeRegNumber.toLowerCase().includes(search.toLowerCase())) ||
      (c.bikeModel && c.bikeModel.toLowerCase().includes(search.toLowerCase()))
  );

  // Customer bills for history modal
  const customerBills: Bill[] = historyCustomer
    ? bills.filter(
        (b) =>
          b.customerId === historyCustomer.id ||
          (b.customerPhone && b.customerPhone === historyCustomer.phone)
      )
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="h-7 w-7 text-blue-600" />
            Customer Management / کسٹمرز کا ریکارڈ
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Customer details, motorcycle model & registration numbers, aur lifetime spending history.
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="lg" className="font-bold shadow-sm">
          <Plus className="h-5 w-5 mr-1.5" />
          Add Customer (نیا کسٹمر شامل کریں)
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, phone number or motorcycle reg # (e.g. KHI-8291)..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-3">Phone Number</th>
                <th className="py-3 px-3">Motorcycle Information</th>
                <th className="py-3 px-3">Address</th>
                <th className="py-3 px-3 text-center">Visits</th>
                <th className="py-3 px-3 text-right">Lifetime Spending</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      {c.notes && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          {c.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-medium text-slate-700">
                      {c.phone}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                        <Bike className="h-3.5 w-3.5 text-blue-600" />
                        <span>{c.bikeModel || "Honda CD 70"}</span>
                      </div>
                      {c.bikeRegNumber && (
                        <div className="text-[11px] font-mono text-slate-500">
                          {c.bikeRegNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 max-w-[200px] truncate">
                      {c.address || "-"}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                      <Badge variant="outline">{c.totalVisits} bills</Badge>
                    </td>

                    <td className="py-3.5 px-3 text-right font-black text-emerald-700 text-sm">
                      {formatPKR(c.totalSpent)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2 text-blue-600"
                          onClick={() => setHistoryCustomer(c)}
                          title="View Purchase History"
                        >
                          <History className="h-3.5 w-3.5 mr-1" />
                          History
                        </Button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Customer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Customer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? "Edit Customer / کسٹمر ریکارڈ تبدیل کریں" : "Add New Customer / نیا کسٹمر شامل کریں"}
        description="Enter customer personal and motorcycle registration details"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Customer Full Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Tariq Mahmood"
          />

          <Input
            label="Phone Number *"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0300-XXXXXXX"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Motorcycle Reg #"
              value={formData.bikeRegNumber}
              onChange={(e) => setFormData({ ...formData, bikeRegNumber: e.target.value })}
              placeholder="e.g. KHI-3450"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Motorcycle Model
              </label>
              <select
                value={formData.bikeModel}
                onChange={(e) => setFormData({ ...formData, bikeModel: e.target.value })}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Honda CD 70">Honda CD 70</option>
                <option value="Honda CG 125">Honda CG 125</option>
                <option value="Honda Pridor 100">Honda Pridor 100</option>
                <option value="Honda CB 150F">Honda CB 150F</option>
                <option value="Yamaha YBR 125">Yamaha YBR 125</option>
                <option value="Suzuki GS 150">Suzuki GS 150</option>
                <option value="Road Prince 70">Road Prince 70</option>
                <option value="United 70">United 70</option>
                <option value="Universal / Other">Universal / Other</option>
              </select>
            </div>
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. North Nazimabad, Karachi"
          />

          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Regular rider, prefers genuine parts"
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingCustomer ? "Save Changes" : "Create Customer"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Purchase History Modal (Quotation requirement) */}
      <Modal
        isOpen={!!historyCustomer}
        onClose={() => setHistoryCustomer(null)}
        title={`Purchase History: ${historyCustomer?.name}`}
        description={`Lifetime Total Spent: ${formatPKR(historyCustomer?.totalSpent || 0)} across ${historyCustomer?.totalVisits || 0} visits`}
        maxWidth="3xl"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Bike: </span>
              <span className="font-bold text-slate-800">
                {historyCustomer?.bikeModel} ({historyCustomer?.bikeRegNumber || "No Reg #"})
              </span>
            </div>
            <div>
              <span className="text-slate-500">Phone: </span>
              <span className="font-bold text-slate-800">{historyCustomer?.phone}</span>
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto space-y-3">
            {customerBills.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No past bills recorded for this customer yet.
              </div>
            ) : (
              customerBills.map((bill) => (
                <div
                  key={bill.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white/80 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-700">{bill.billNumber}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{formatDateTime(bill.createdAt)}</span>
                    </div>
                    <div className="font-black text-slate-900">
                      {formatPKR(bill.grandTotal)}
                    </div>
                  </div>

                  {/* Purchased items list */}
                  <div className="bg-slate-50 rounded-lg p-2 space-y-1">
                    {bill.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-[11px] text-slate-700"
                      >
                        <span>
                          {item.quantity}x {item.partName}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatPKR(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setHistoryCustomer(null)}>
              Close History
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
