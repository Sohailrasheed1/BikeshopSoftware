"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Bike,
  Receipt,
  ShoppingCart,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ReceiptModal } from "@/components/pos/receipt-modal";
import { useStore } from "@/lib/storage/context";
import { Part, Customer, Bill, BillItem } from "@/types";
import { formatPKR } from "@/lib/utils";

export default function BillingPage() {
  const { parts, customers, createBill, addCustomer } = useStore();

  // Search & Cart State
  const [partSearch, setPartSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [cart, setCart] = useState<BillItem[]>([]);

  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [bikeRegNumber, setBikeRegNumber] = useState<string>("");
  const [bikeModel, setBikeModel] = useState<string>("Honda CD 70");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // Billing Totals State
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash" | "EasyPaisa / JazzCash" | "Bank Transfer" | "Udhaar / Credit"
  >("Cash");
  const [notes, setNotes] = useState<string>("");

  // Feedback & Receipt Modal
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successBill, setSuccessBill] = useState<Bill | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Customer Selection
  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    if (!custId) {
      setCustomerName("Walk-in Customer");
      setCustomerPhone("");
      setBikeRegNumber("");
      setBikeModel("Honda CD 70");
      setCustomerAddress("");
      return;
    }
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone);
      setBikeRegNumber(cust.bikeRegNumber || "");
      setBikeModel(cust.bikeModel || "Honda CD 70");
      setCustomerAddress(cust.address || "");
    }
  };

  // Add Part to Cart
  const handleAddToCart = (part: Part) => {
    setErrorMessage("");
    if (part.currentStock <= 0) {
      setErrorMessage(`"${part.name}" is completely out of stock!`);
      return;
    }

    const existingIndex = cart.findIndex((item) => item.partId === part.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + 1 > part.currentStock) {
        setErrorMessage(
          `Cannot add more! Only ${part.currentStock} units available for "${part.name}".`
        );
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      updatedCart[existingIndex].totalPrice =
        updatedCart[existingIndex].quantity * updatedCart[existingIndex].unitPrice;
      setCart(updatedCart);
    } else {
      const newItem: BillItem = {
        partId: part.id,
        partName: part.name,
        category: part.category,
        quantity: 1,
        unitPrice: part.sellingPrice,
        purchasePrice: part.purchasePrice,
        totalPrice: part.sellingPrice,
      };
      setCart([...cart, newItem]);
    }
  };

  // Update Cart Quantity
  const handleUpdateQuantity = (partId: string, delta: number) => {
    setErrorMessage("");
    const part = parts.find((p) => p.id === partId);
    const existingIndex = cart.findIndex((item) => item.partId === partId);
    if (existingIndex === -1 || !part) return;

    const newQty = cart[existingIndex].quantity + delta;
    if (newQty <= 0) {
      handleRemoveItem(partId);
      return;
    }

    if (newQty > part.currentStock) {
      setErrorMessage(
        `Cannot add more! Available stock for "${part.name}" is ${part.currentStock}.`
      );
      return;
    }

    const updated = [...cart];
    updated[existingIndex].quantity = newQty;
    updated[existingIndex].totalPrice = newQty * updated[existingIndex].unitPrice;
    setCart(updated);
  };

  // Remove Item
  const handleRemoveItem = (partId: string) => {
    setCart(cart.filter((item) => item.partId !== partId));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0));

  // Save Bill
  const handleCompleteBill = async () => {
    setErrorMessage("");
    if (cart.length === 0) {
      setErrorMessage("Khaali bill save nahi ho sakta! Please add parts to the bill.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createBill({
        customerId: selectedCustomerId || undefined,
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || undefined,
        bikeRegNumber: bikeRegNumber || undefined,
        bikeModel: bikeModel || undefined,
        customerAddress: customerAddress || undefined,
        items: cart,
        subtotal,
        discount: Number(discount) || 0,
        tax: 0,
        grandTotal,
        paidAmount: grandTotal,
        paymentMethod,
        notes: notes || undefined,
      });

      // Open print receipt modal
      setSuccessBill(created);
      setIsReceiptModalOpen(true);

      // Reset cart
      setCart([]);
      setDiscount(0);
      setNotes("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate bill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Parts Catalog
  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(partSearch.toLowerCase()) ||
      part.category.toLowerCase().includes(partSearch.toLowerCase()) ||
      (part.sku && part.sku.toLowerCase().includes(partSearch.toLowerCase()));

    const matchesCategory =
      categoryFilter === "All" || part.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All",
    "Engine & Transmission",
    "Brakes & Clutch",
    "Electrical & Battery",
    "Body, Lights & Mirrors",
    "Suspension & Fork",
    "Tyres & Tubes",
    "Chains & Sprockets",
    "Oils & Lubricants",
    "Accessories & General",
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="h-7 w-7 text-blue-600" />
            Fast Billing & Counter POS
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Parts select karein, customer bike details add karein aur turant receipt print karein.
          </p>
        </div>
      </div>

      {/* Error / Alert notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main POS Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Customer Selection & Parts Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Customer Selection Card */}
          <Card className="glass-card">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  Customer & Motorcycle Details
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-semibold"
                  onClick={() => setIsNewCustomerModalOpen(true)}
                >
                  + Add New Customer
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Select Existing Customer
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={handleSelectCustomer}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white/90 px-3 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Walk-in / Cash Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) - {c.bikeModel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              {/* Motorcycle Details (Quotation Requirement) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-100">
                <div>
                  <Input
                    label="Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0300-XXXXXXX"
                    className="h-10 text-xs"
                  />
                </div>
                <div>
                  <Input
                    label="Motorcycle Reg #"
                    value={bikeRegNumber}
                    onChange={(e) => setBikeRegNumber(e.target.value)}
                    placeholder="e.g. KHI-8291"
                    className="h-10 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Bike Model / Type
                  </label>
                  <select
                    value={bikeModel}
                    onChange={(e) => setBikeModel(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white/90 px-3 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Honda CD 70">Honda CD 70</option>
                    <option value="Honda CG 125">Honda CG 125</option>
                    <option value="Honda Pridor 100">Honda Pridor 100</option>
                    <option value="Yamaha YBR 125">Yamaha YBR 125</option>
                    <option value="Suzuki GS 150">Suzuki GS 150</option>
                    <option value="Road Prince 70">Road Prince 70</option>
                    <option value="United 70">United 70</option>
                    <option value="Universal / Other">Universal / Other</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parts Search & Catalog */}
          <Card className="glass-card">
            <CardHeader className="pb-3 border-b border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  Spare Parts Catalog / پرزہ منتخب کریں
                </CardTitle>
                <span className="text-xs font-medium text-slate-500">
                  {filteredParts.length} parts found
                </span>
              </div>

              {/* Search Bar & Category Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    placeholder="Search by part name, SKU, or category (e.g. CD70 piston, brake shoe, oil)..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`whitespace-nowrap px-2.5 py-1 rounded-lg font-semibold transition ${
                        categoryFilter === cat
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-3">
              <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                {filteredParts.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Koi part nahi mila. Search check karein ya naya part add karein.
                  </div>
                ) : (
                  filteredParts.map((part) => {
                    const isOutOfStock = part.currentStock <= 0;
                    const isLowStock =
                      part.currentStock > 0 && part.currentStock <= part.minStockLimit;

                    return (
                      <div
                        key={part.id}
                        className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                          isOutOfStock
                            ? "bg-slate-50/50 border-slate-200 opacity-60"
                            : "bg-white/80 border-slate-200/80 hover:border-blue-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {part.name}
                            </span>
                            {part.sku && (
                              <span className="text-[10px] font-mono text-slate-400">
                                #{part.sku}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{part.category}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">
                              Stock: {part.currentStock}
                            </span>
                            {isOutOfStock ? (
                              <Badge variant="danger" className="text-[10px] py-0">
                                Out of Stock
                              </Badge>
                            ) : isLowStock ? (
                              <Badge variant="warning" className="text-[10px] py-0">
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="success" className="text-[10px] py-0">
                                Available
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-black text-sm text-slate-900">
                              {formatPKR(part.sellingPrice)}
                            </div>
                            <div className="text-[10px] text-slate-400">per piece</div>
                          </div>

                          <Button
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() => handleAddToCart(part)}
                            className="h-8 px-3 font-bold text-xs"
                            variant={isOutOfStock ? "secondary" : "primary"}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Active Bill Cart & Checkout (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="glass-card sticky top-20 shadow-md">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-blue-600" />
                  Current Bill / موجودہ بل
                </CardTitle>
                <div className="text-[11px] text-slate-500 font-medium">
                  {cart.length} unique items in bill
                </div>
              </div>

              {cart.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-rose-600 hover:text-rose-700"
                  onClick={() => setCart([])}
                >
                  Clear All
                </Button>
              )}
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Itemized Cart List */}
              <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <ShoppingCart className="h-10 w-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">
                      Bill is empty
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Left side se parts search karke add karein
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.partId}
                      className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {item.partName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formatPKR(item.unitPrice)} each
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.partId, -1)}
                          className="h-6 w-6 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 shadow-xs"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.partId, 1)}
                          className="h-6 w-6 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 shadow-xs"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Line Total & Delete */}
                      <div className="text-right min-w-[70px]">
                        <div className="font-black text-xs text-slate-900">
                          {formatPKR(item.totalPrice)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.partId)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Bill Totals & Discount */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800">{formatPKR(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Percent className="h-3.5 w-3.5 text-blue-600" />
                    Discount (Rs.):
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-24 h-8 rounded-lg border border-slate-200 text-right px-2 text-xs font-bold text-emerald-700 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-base font-black text-slate-900">
                  <span>Grand Total:</span>
                  <span className="text-lg text-blue-700">{formatPKR(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(
                    ["Cash", "EasyPaisa / JazzCash", "Bank Transfer", "Udhaar / Credit"] as const
                  ).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2 rounded-xl border text-center font-bold transition ${
                        paymentMethod === method
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkout / Print Action */}
              <div className="pt-2">
                <Button
                  onClick={handleCompleteBill}
                  disabled={cart.length === 0 || isSubmitting}
                  isLoading={isSubmitting}
                  size="lg"
                  className="w-full font-black text-sm shadow-md"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Save & Print Bill ({formatPKR(grandTotal)})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Add New Customer Modal */}
      <QuickAddCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onCreated={(cust) => {
          setSelectedCustomerId(cust.id);
          setCustomerName(cust.name);
          setCustomerPhone(cust.phone);
          setBikeRegNumber(cust.bikeRegNumber);
          setBikeModel(cust.bikeModel);
          setIsNewCustomerModalOpen(false);
        }}
      />

      {/* Print Receipt Modal */}
      <ReceiptModal
        bill={successBill}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
}

// Subcomponent: Quick Add Customer Modal
function QuickAddCustomerModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (cust: Customer) => void;
}) {
  const { addCustomer } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bikeReg, setBikeReg] = useState("");
  const [bikeModel, setBikeModel] = useState("Honda CD 70");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    const created = await addCustomer({
      name,
      phone,
      bikeRegNumber: bikeReg,
      bikeModel,
      address,
    });
    onCreated(created);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer / نیا کسٹمر رجسٹر کریں"
      description="Quickly save customer details with motorcycle registration"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Customer Full Name *"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Asif Raza"
        />
        <Input
          label="Phone Number *"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0300-XXXXXXX"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Motorcycle Reg #"
            value={bikeReg}
            onChange={(e) => setBikeReg(e.target.value)}
            placeholder="e.g. KHI-1234"
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Bike Model
            </label>
            <select
              value={bikeModel}
              onChange={(e) => setBikeModel(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white/90 px-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="Honda CD 70">Honda CD 70</option>
              <option value="Honda CG 125">Honda CG 125</option>
              <option value="Yamaha YBR 125">Yamaha YBR 125</option>
              <option value="Suzuki GS 150">Suzuki GS 150</option>
              <option value="Road Prince 70">Road Prince 70</option>
              <option value="United 70">United 70</option>
            </select>
          </div>
        </div>
        <Input
          label="Address (Optional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Area / Karachi locality"
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Customer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
