"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Users,
  Receipt,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  WalletCards,
  CheckCircle2,
  Printer,
  ChevronRight,
  Package,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReceiptModal } from "@/components/pos/receipt-modal";
import { useStore } from "@/lib/storage/context";
import { formatPKR, formatDate, formatDateTime, daysSince } from "@/lib/utils";
import { Bill } from "@/types";

export default function DashboardPage() {
  const { stats, parts, bills, supplierCredits } = useStore();
  const [activeTab, setActiveTab] = useState<"bills" | "stock" | "credits">("bills");
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<Bill | null>(null);

  const lowStockParts = parts.filter(
    (p) => p.currentStock <= p.minStockLimit
  );

  const overdueCredits = supplierCredits.filter(
    (c) => c.status !== "Paid" && daysSince(c.purchaseDate) >= 15
  );

  const recentBills = bills.slice(0, 6);

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-300">
      {/* Top Welcome Header - Clean & Focused */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Counter Khula Hai
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Skander Spare Parts
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Khush Amdeed, Dukan Ka Khulasa 🏍️
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-xl">
            Aaj ki bikri, saman ka stock, gahak ka hisab aur supplier udhaar sab yahan se control karein.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/billing" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 text-sm h-11 px-5"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Naya Bill Banayein
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Clean Metric Cards (High Readability) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <Link href="/reports">
          <Card className="glass-card-hover border-slate-200/80 hover:border-emerald-300 cursor-pointer h-full">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Aaj Ki Bikri (Sales)
                </span>
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
                {formatPKR(stats.todaySales)}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-bold text-slate-700">{stats.todayBillsCount} Bills</span>
                <span>aaj banaye gaye</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Total Inventory Value */}
        <Link href="/inventory">
          <Card className="glass-card-hover border-slate-200/80 hover:border-blue-300 cursor-pointer h-full">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kul Stock Ki Qeemat
                </span>
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Boxes className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {formatPKR(stats.totalInventoryValue)}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-bold text-slate-700">{stats.totalPartsCount} Parts</span>
                <span>dukan mein hain</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Low Stock Alerts */}
        <div
          onClick={() => setActiveTab("stock")}
          className="cursor-pointer"
        >
          <Card
            className={`glass-card-hover h-full transition ${
              stats.lowStockCount > 0
                ? "border-amber-300 bg-amber-50/40"
                : "border-slate-200/80"
            }`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kam Stock (Alerts)
                </span>
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
                    stats.lowStockCount > 0
                      ? "bg-amber-100 text-amber-700 border-amber-200 animate-pulse"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div
                className={`text-2xl sm:text-3xl font-black mt-2 ${
                  stats.lowStockCount > 0 ? "text-amber-700" : "text-slate-800"
                }`}
              >
                {stats.lowStockCount} Parts
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {stats.lowStockCount > 0 ? (
                  <span className="text-amber-800 font-semibold">
                    Stock mangwane ki zaroorat hai
                  </span>
                ) : (
                  <span>Sab parts ka stock theek hai</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Supplier Udhaar */}
        <Link href="/suppliers">
          <Card
            className={`glass-card-hover h-full transition ${
              stats.overdue15DaysCreditCount > 0
                ? "border-rose-300 bg-rose-50/30"
                : "border-slate-200/80"
            }`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Supplier Ka Udhaar
                </span>
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
                    stats.overdue15DaysCreditCount > 0
                      ? "bg-rose-100 text-rose-700 border-rose-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  <WalletCards className="h-5 w-5" />
                </div>
              </div>
              <div
                className={`text-2xl sm:text-3xl font-black mt-2 ${
                  stats.totalPendingSupplierCredit > 0 ? "text-rose-700" : "text-slate-900"
                }`}
              >
                {formatPKR(stats.totalPendingSupplierCredit)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {stats.overdue15DaysCreditCount > 0 ? (
                  <span className="text-rose-700 font-bold">
                    {stats.overdue15DaysCreditCount} udhaar 15+ din se pending
                  </span>
                ) : (
                  <span>Khata theek chal raha hai</span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 4 Fast Shortcuts for Counter Boy / Cashier */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/billing"
          className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-sm transition flex items-center gap-3 group"
        >
          <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Naya Bill</div>
            <div className="text-[11px] text-slate-400">Parchi banayein</div>
          </div>
        </Link>

        <Link
          href="/inventory"
          className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-sm transition flex items-center gap-3 group"
        >
          <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Stock Check</div>
            <div className="text-[11px] text-slate-400">Saman ki tadad</div>
          </div>
        </Link>

        <Link
          href="/customers"
          className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-sm transition flex items-center gap-3 group"
        >
          <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Gahak Khata</div>
            <div className="text-[11px] text-slate-400">Bike & phone record</div>
          </div>
        </Link>

        <Link
          href="/suppliers"
          className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-sm transition flex items-center gap-3 group"
        >
          <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
            <WalletCards className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Supplier Dena</div>
            <div className="text-[11px] text-slate-400">Udhaar hisab</div>
          </div>
        </Link>
      </div>

      {/* Main Tabbed Information - Zero Clutter, Progressive Disclosure */}
      <Card className="glass-card shadow-sm border-slate-200/80">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Clean Segmented Tab Control */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 self-start">
              <button
                type="button"
                onClick={() => setActiveTab("bills")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeTab === "bills"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🧾 Taaza Bills ({recentBills.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stock")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeTab === "stock"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ⚠️ Kam Stock Alerts ({lowStockParts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("credits")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeTab === "credits"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ⏳ Supplier Udhaar ({overdueCredits.length})
              </button>
            </div>

            <Link
              href={
                activeTab === "bills"
                  ? "/bills"
                  : activeTab === "stock"
                  ? "/inventory"
                  : "/suppliers"
              }
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-end sm:self-center"
            >
              <span>Mukammal Record Dekhein</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* TAB 1: Recent Bills */}
          {activeTab === "bills" && (
            <div className="divide-y divide-slate-100">
              {recentBills.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Abhi tak koi bill nahi bana.
                </div>
              ) : (
                recentBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-600">
                          {bill.billNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {bill.customerName || "Walk-in Customer"}
                        </span>
                        {bill.bikeModel && (
                          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] py-0">
                            {bill.bikeModel}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{formatDateTime(bill.createdAt)}</span>
                        <span>•</span>
                        <span>{bill.items.length} cheezen</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600">
                          {bill.paymentMethod}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-black text-sm text-slate-900">
                          {formatPKR(bill.grandTotal)}
                        </div>
                        <Badge
                          variant={bill.status === "Completed" ? "success" : "danger"}
                          className="text-[10px] py-0"
                        >
                          {bill.status === "Completed" ? "Ada Ho Gaya" : "Mansookh"}
                        </Badge>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs text-slate-600"
                        onClick={() => setSelectedBillForPrint(bill)}
                        title="Print Receipt"
                      >
                        <Printer className="h-3.5 w-3.5 mr-1 text-slate-500" />
                        <span className="hidden sm:inline">Parchi</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Low Stock Alerts */}
          {activeTab === "stock" && (
            <div className="divide-y divide-slate-100">
              {lowStockParts.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-1">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-bold">MashaAllah! Sab parts ka stock theek hai.</p>
                  <p className="text-slate-400">Koi bhi saman kam ya khatam nahi hai.</p>
                </div>
              ) : (
                lowStockParts.map((part) => {
                  const isZero = part.currentStock === 0;

                  return (
                    <div
                      key={part.id}
                      className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {part.name}
                          </span>
                          <Badge
                            variant={isZero ? "danger" : "warning"}
                            className="text-[10px] py-0"
                          >
                            {isZero ? "Khatam" : "Kam Stock"}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {part.category} • Supplier: {part.supplierName}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div
                            className={`font-black text-sm ${
                              isZero ? "text-rose-600" : "text-amber-700"
                            }`}
                          >
                            {part.currentStock} Baqi
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Hadd: {part.minStockLimit}
                          </div>
                        </div>

                        <Link href="/inventory">
                          <Button size="sm" variant="secondary" className="h-8 text-xs font-semibold">
                            Stock Barhayein
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: Overdue Supplier Credits */}
          {activeTab === "credits" && (
            <div className="divide-y divide-slate-100">
              {overdueCredits.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-1">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-bold">Koi bhi 15 din purana udhaar pending nahi hai!</p>
                  <p className="text-slate-400">Suppliers ka khata bilkul update hai.</p>
                </div>
              ) : (
                overdueCredits.map((credit) => {
                  const days = daysSince(credit.purchaseDate);

                  return (
                    <div
                      key={credit.id}
                      className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {credit.supplierName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {credit.supplierPhone}
                          </span>
                          <Badge variant="danger" className="text-[10px] py-0 animate-pulse">
                            {days} Din Ho Gaye
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Maal: {credit.purchasedParts}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-black text-sm text-rose-600">
                            {formatPKR(credit.remainingBalance)}
                          </div>
                          <div className="text-[10px] text-slate-400">Baqaya Dena Hai</div>
                        </div>

                        <Link href="/suppliers">
                          <Button size="sm" className="h-8 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
                            Payment Karein
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Receipt Modal */}
      <ReceiptModal
        bill={selectedBillForPrint}
        isOpen={!!selectedBillForPrint}
        onClose={() => setSelectedBillForPrint(null)}
      />
    </div>
  );
}
