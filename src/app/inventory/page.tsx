"use client";

import React, { useState } from "react";
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  Edit,
  Trash2,
  TrendingUp,
  Tag,
  Store,
  Layers,
  CheckCircle,
  XCircle,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useStore } from "@/lib/storage/context";
import { Part, PartCategory } from "@/types";
import { formatPKR, formatDate } from "@/lib/utils";

const CATEGORIES: PartCategory[] = [
  "Engine & Transmission",
  "Brakes & Clutch",
  "Electrical & Battery",
  "Body, Lights & Mirrors",
  "Suspension & Fork",
  "Tyres & Tubes",
  "Cables & Levers",
  "Oils & Lubricants",
  "Chains & Sprockets",
  "Accessories & General",
];

export default function InventoryPage() {
  const { parts, addPart, updatePart, deletePart, updateStock } = useStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [stockStatusFilter, setStockStatusFilter] = useState<"All" | "Low" | "Out">("All");

  // Add / Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Engine & Transmission" as PartCategory,
    sku: "",
    compatibleModels: "Honda CD 70, United 70",
    purchasePrice: 0,
    sellingPrice: 0,
    currentStock: 10,
    minStockLimit: 5,
    supplierName: "",
    supplierPhone: "",
    location: "Rack A-1",
  });

  const handleOpenAdd = () => {
    setEditingPart(null);
    setFormData({
      name: "",
      category: "Engine & Transmission",
      sku: "",
      compatibleModels: "Honda CD 70, United 70",
      purchasePrice: 0,
      sellingPrice: 0,
      currentStock: 10,
      minStockLimit: 5,
      supplierName: "",
      supplierPhone: "",
      location: "Rack A-1",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (part: Part) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      category: part.category,
      sku: part.sku || "",
      compatibleModels: part.compatibleModels.join(", "),
      purchasePrice: part.purchasePrice,
      sellingPrice: part.sellingPrice,
      currentStock: part.currentStock,
      minStockLimit: part.minStockLimit,
      supplierName: part.supplierName,
      supplierPhone: part.supplierPhone || "",
      location: part.location || "",
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const models = formData.compatibleModels
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    if (editingPart) {
      await updatePart(editingPart.id, {
        name: formData.name,
        category: formData.category,
        sku: formData.sku || undefined,
        compatibleModels: models,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        currentStock: Number(formData.currentStock) || 0,
        minStockLimit: Number(formData.minStockLimit) || 0,
        supplierName: formData.supplierName,
        supplierPhone: formData.supplierPhone || undefined,
        location: formData.location || undefined,
      });
    } else {
      await addPart({
        name: formData.name,
        category: formData.category,
        sku: formData.sku || undefined,
        compatibleModels: models,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        currentStock: Number(formData.currentStock) || 0,
        minStockLimit: Number(formData.minStockLimit) || 0,
        supplierName: formData.supplierName || "Local Supplier",
        supplierPhone: formData.supplierPhone || undefined,
        location: formData.location || undefined,
      });
    }
    setIsAddModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this spare part from catalog?")) {
      await deletePart(id);
    }
  };

  // Filter Logic
  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(search.toLowerCase()) ||
      part.category.toLowerCase().includes(search.toLowerCase()) ||
      (part.sku && part.sku.toLowerCase().includes(search.toLowerCase())) ||
      part.supplierName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || part.category === selectedCategory;

    let matchesStock = true;
    if (stockStatusFilter === "Low") {
      matchesStock = part.currentStock > 0 && part.currentStock <= part.minStockLimit;
    } else if (stockStatusFilter === "Out") {
      matchesStock = part.currentStock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="h-7 w-7 text-blue-600" />
            Inventory & Stock Management / اسٹاک کا نظام
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Parts stock track karein, purchase/selling price maintain karein aur low stock alerts check karein.
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="lg" className="font-bold shadow-sm">
          <Plus className="h-5 w-5 mr-1.5" />
          Add New Part (نیا پرزہ شامل کریں)
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="glass-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search part name, category, SKU or supplier..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Category Select */}
            <div className="w-full md:w-56">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Categories (تمام کیٹگریز)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Filter Pills */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start">
              <button
                type="button"
                onClick={() => setStockStatusFilter("All")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  stockStatusFilter === "All"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Stock
              </button>
              <button
                type="button"
                onClick={() => setStockStatusFilter("Low")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  stockStatusFilter === "Low"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-amber-800 hover:text-amber-950"
                }`}
              >
                Low Stock
              </button>
              <button
                type="button"
                onClick={() => setStockStatusFilter("Out")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  stockStatusFilter === "Out"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-rose-800 hover:text-rose-950"
                }`}
              >
                Out of Stock
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parts Table */}
      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Part Name & Category</th>
                <th className="py-3 px-3">SKU / Shelf</th>
                <th className="py-3 px-3 text-right">Cost Price</th>
                <th className="py-3 px-3 text-right">Sale Price</th>
                <th className="py-3 px-3 text-center">Current Stock</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No parts match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isZero = part.currentStock === 0;
                  const isLow =
                    part.currentStock > 0 && part.currentStock <= part.minStockLimit;
                  const margin = part.sellingPrice - part.purchasePrice;
                  const marginPercent = Math.round((margin / part.purchasePrice) * 100);

                  return (
                    <tr
                      key={part.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="font-bold text-slate-900 leading-snug">
                          {part.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          {part.category} • Fits: {part.compatibleModels.join(", ")}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">
                        <div>{part.sku || "-"}</div>
                        <div className="text-[10px] text-slate-400">{part.location}</div>
                      </td>

                      <td className="py-3.5 px-3 text-right text-slate-600 font-medium">
                        {formatPKR(part.purchasePrice)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                        <div>{formatPKR(part.sellingPrice)}</div>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          +{marginPercent}% profit
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateStock(part.id, -1)}
                            className="text-slate-400 hover:text-slate-700 p-0.5"
                            title="Decrease stock by 1"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </button>
                          <span
                            className={`font-black text-sm px-2 py-0.5 rounded-lg ${
                              isZero
                                ? "bg-rose-100 text-rose-800"
                                : isLow
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {part.currentStock}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateStock(part.id, 1)}
                            className="text-slate-400 hover:text-slate-700 p-0.5"
                            title="Increase stock by 1"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Min limit: {part.minStockLimit}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <Badge
                          variant={isZero ? "danger" : isLow ? "warning" : "success"}
                        >
                          {isZero ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-3 text-slate-700">
                        <div className="font-semibold">{part.supplierName}</div>
                        {part.supplierPhone && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {part.supplierPhone}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(part)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit Part"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(part.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Part"
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

      {/* Add / Edit Part Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingPart ? "Edit Spare Part / پرزہ تبدیل کریں" : "Add New Part / نیا پرزہ شامل کریں"}
        description="Enter full part specifications, prices, stock and supplier details"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Part Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Atlas Honda Piston 70cc Standard"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as PartCategory })
                }
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="SKU / Item Code"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. ENG-PST-01"
            />
          </div>

          <Input
            label="Compatible Bikes (Comma separated)"
            value={formData.compatibleModels}
            onChange={(e) => setFormData({ ...formData, compatibleModels: e.target.value })}
            placeholder="e.g. Honda CD 70, United 70, Road Prince 70"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Cost Price (Rs.) *"
              type="number"
              required
              min="0"
              value={formData.purchasePrice || ""}
              onChange={(e) =>
                setFormData({ ...formData, purchasePrice: Number(e.target.value) })
              }
              placeholder="1150"
            />
            <Input
              label="Sale Price (Rs.) *"
              type="number"
              required
              min="0"
              value={formData.sellingPrice || ""}
              onChange={(e) =>
                setFormData({ ...formData, sellingPrice: Number(e.target.value) })
              }
              placeholder="1550"
            />
            <Input
              label="Current Stock *"
              type="number"
              required
              min="0"
              value={formData.currentStock}
              onChange={(e) =>
                setFormData({ ...formData, currentStock: Number(e.target.value) })
              }
              placeholder="10"
            />
            <Input
              label="Low Alert Limit *"
              type="number"
              required
              min="1"
              value={formData.minStockLimit}
              onChange={(e) =>
                setFormData({ ...formData, minStockLimit: Number(e.target.value) })
              }
              placeholder="5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Supplier Name"
              value={formData.supplierName}
              onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              placeholder="e.g. Karachi Autos (Akbar Road)"
            />
            <Input
              label="Supplier Phone"
              value={formData.supplierPhone}
              onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
              placeholder="0300-XXXXXXX"
            />
            <Input
              label="Rack / Shelf Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Rack A-02"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingPart ? "Save Changes" : "Create Spare Part"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
