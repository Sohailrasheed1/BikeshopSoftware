"use client";

import React from "react";
import Link from "next/link";
import {
  Boxes,
  Users,
  Receipt,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  Clock,
  CheckCircle,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/storage/context";
import { formatPKR, formatDate, daysSince } from "@/lib/utils";

export default function DashboardPage() {
  const { stats, parts, bills, supplierCredits, updateStock } = useStore();

  const lowStockParts = parts.filter(
    (p) => p.currentStock <= p.minStockLimit
  );

  const overdueCredits = supplierCredits.filter(
    (c) => c.status !== "Paid" && daysSince(c.purchaseDate) >= 15
  );

  const recentBills = bills.slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white/90">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Shop Open & Ready for Billing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Skander Spare Parts Dashboard
          </h1>
          <p className="text-blue-100 text-sm max-w-xl">
            Stock, customer records, billing receipts aur supplier udhaar — sab ek hi jagah control karein.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/billing">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md hover:shadow-lg border-none"
            >
              <PlusCircle className="h-5 w-5 mr-2 text-blue-600" />
              New Bill (بل بنائیں)
            </Button>
          </Link>
          <Link href="/inventory">
            <Button
              size="lg"
              variant="glass"
              className="bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-md"
            >
              <Boxes className="h-5 w-5 mr-2" />
              Manage Stock
            </Button>
          </Link>
        </div>
      </div>

      {/* 15+ Days Overdue Supplier Credit Warning (Critical Quotation Feature) */}
      {overdueCredits.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border-amber-300/80 bg-amber-50/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-amber-950 text-base">
                  Supplier Credit Overdue Warning (15+ Days Pending)
                </h3>
                <Badge variant="danger" className="text-[11px] font-bold">
                  {overdueCredits.length} Suppliers Due
                </Badge>
              </div>
              <p className="text-xs text-amber-900/80 mt-0.5">
                In suppliers ka udhaar 15 din se zyada ho chuka hai. Cash-flow theek rakhne ke liye payment follow-up karein.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/suppliers">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm">
                View Khata Details
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Inventory Value */}
        <Card className="glass-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Stock Value
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Boxes className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {formatPKR(stats.totalInventoryValue)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{stats.totalPartsCount} Total Parts</span> in catalog
            </div>
          </CardContent>
        </Card>

        {/* Today's Sales */}
        <Card className="glass-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today&apos;s Sales / آج کی بکری
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">
              {formatPKR(stats.todaySales)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{stats.todayBillsCount} Bills</span> generated today
            </div>
          </CardContent>
        </Card>

        {/* Low & Out of Stock Alerts */}
        <Card className="glass-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Stock Warnings
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {stats.lowStockCount + stats.outOfStockCount}
              </span>
              <span className="text-xs text-slate-500">Items need restock</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="font-semibold text-rose-600">{stats.outOfStockCount} Out of stock</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-amber-600">{stats.lowStockCount} Low stock</span>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Udhaar / Credit */}
        <Card className="glass-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Supplier Khata (Udhaar)
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {formatPKR(stats.totalPendingSupplierCredit)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-amber-600">
                {stats.overdue15DaysCreditCount} overdue (&gt;15 days)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Grid: Low Stock Alert Table & Recent Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Low Stock Alerts (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">
                Low Stock & Out-of-Stock Alerts
              </h2>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Full Inventory
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
            {lowStockParts.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">
                  Stock is fully healthy!
                </p>
                <p className="text-xs text-slate-500">
                  Koi bhi part minimum stock limit se niche nahi hai.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Part Name</th>
                      <th className="py-3 px-3 text-center">Current Stock</th>
                      <th className="py-3 px-3 text-center">Min Limit</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {lowStockParts.slice(0, 6).map((part) => {
                      const isZero = part.currentStock === 0;
                      return (
                        <tr key={part.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <div>{part.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {part.category} • {part.supplierName}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                                isZero
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {part.currentStock}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-500 font-medium">
                            {part.minStockLimit}
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant={isZero ? "danger" : "warning"}>
                              {isZero ? "Out of Stock" : "Low Stock"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-semibold px-2.5"
                              onClick={() => updateStock(part.id, 10)}
                              title="Add 10 units to stock"
                            >
                              +10 Add
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Bills (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Recent Bills / حالیہ بلز
              </h2>
            </div>
            <Link
              href="/bills"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              All Bills
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="glass-card rounded-2xl p-4 shadow-sm space-y-3">
            {recentBills.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Abhi tak koi bill generate nahi hua.
              </p>
            ) : (
              recentBills.map((bill) => (
                <div
                  key={bill.id}
                  className="p-3 rounded-xl bg-white/70 border border-slate-100 hover:border-slate-200 transition flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-blue-700">
                        {bill.billNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(bill.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      {bill.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {[bill.bikeModel, bill.bikeRegNumber].filter(Boolean).join(" • ") ||
                        `${bill.items.length} items`}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-black text-sm text-slate-900">
                      {formatPKR(bill.grandTotal)}
                    </div>
                    <Badge variant={bill.status === "Completed" ? "success" : "danger"}>
                      {bill.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}

            <div className="pt-2">
              <Link href="/billing" className="block">
                <Button className="w-full font-bold shadow-sm" variant="primary">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Bill (نواں بل بنائیں)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
