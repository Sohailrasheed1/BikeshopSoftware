"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Download,
  Printer,
  DollarSign,
  Package,
  Receipt,
  Layers,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/storage/context";
import { formatPKR, formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const { bills, parts } = useStore();
  const [reportType, setReportType] = useState<"daily" | "monthly" | "yearly">("daily");

  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
  const currentYearStr = todayStr.substring(0, 4);  // YYYY

  // Filter bills based on report type
  const completedBills = bills.filter((b) => b.status === "Completed");

  const dailyBills = completedBills.filter((b) => b.createdAt.startsWith(todayStr));
  const monthlyBills = completedBills.filter((b) => b.createdAt.startsWith(currentMonthStr));
  const yearlyBills = completedBills.filter((b) => b.createdAt.startsWith(currentYearStr));

  const activeBills =
    reportType === "daily" ? dailyBills : reportType === "monthly" ? monthlyBills : yearlyBills;

  // Key Aggregates
  const totalRevenue = activeBills.reduce((acc, b) => acc + b.grandTotal, 0);
  const totalBillsCount = activeBills.length;

  let totalItemsSold = 0;
  let estimatedCost = 0;

  // Top Selling Parts Map
  const partSalesMap: Record<
    string,
    { partName: string; category: string; quantity: number; revenue: number }
  > = {};

  activeBills.forEach((bill) => {
    bill.items.forEach((item) => {
      totalItemsSold += item.quantity;
      estimatedCost += item.purchasePrice * item.quantity;

      if (!partSalesMap[item.partId]) {
        partSalesMap[item.partId] = {
          partName: item.partName,
          category: item.category,
          quantity: 0,
          revenue: 0,
        };
      }
      partSalesMap[item.partId].quantity += item.quantity;
      partSalesMap[item.partId].revenue += item.totalPrice;
    });
  });

  const estimatedProfit = Math.max(0, totalRevenue - estimatedCost);
  const profitMarginPercent = totalRevenue > 0 ? Math.round((estimatedProfit / totalRevenue) * 100) : 0;

  const topSellingParts = Object.values(partSalesMap).sort(
    (a, b) => b.quantity - a.quantity
  );

  // CSV Export Feature
  const handleExportCSV = () => {
    const headers = ["Bill Number", "Date", "Customer Name", "Phone", "Bike Model", "Bike Reg", "Items Sold", "Total Amount", "Payment Method"];
    const rows = activeBills.map((b) => [
      b.billNumber,
      formatDate(b.createdAt),
      `"${b.customerName}"`,
      b.customerPhone || "-",
      b.bikeModel || "-",
      b.bikeRegNumber || "-",
      b.items.reduce((acc, it) => acc + it.quantity, 0),
      b.grandTotal,
      b.paymentMethod,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `skander_parts_report_${reportType}_${todayStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            Reports & Business Analytics / کاروباری رپورٹس
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Daily, Monthly aur Yearly sales reports, munafa (profit) aur top-selling motorcycle parts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="md"
            className="text-xs font-bold"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button
            onClick={() => window.print()}
            variant="secondary"
            size="md"
            className="text-xs font-bold"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Report Period Selector */}
      <Card className="glass-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setReportType("daily")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                reportType === "daily"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Daily Report (آج کی رپورٹ)
            </button>
            <button
              type="button"
              onClick={() => setReportType("monthly")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                reportType === "monthly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Report (ماہانہ رپورٹ)
            </button>
            <button
              type="button"
              onClick={() => setReportType("yearly")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                reportType === "yearly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Yearly Report (سالانہ رپورٹ)
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border">
            Reporting Period:{" "}
            <span className="text-blue-700 font-bold uppercase">
              {reportType === "daily"
                ? `Today (${todayStr})`
                : reportType === "monthly"
                ? `Month (${currentMonthStr})`
                : `Year (${currentYearStr})`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Revenue / کل بکری
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {formatPKR(totalRevenue)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              from {totalBillsCount} completed bills
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estimated Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">
              {formatPKR(estimatedProfit)}
            </div>
            <div className="mt-1 text-xs text-emerald-700 font-semibold">
              ~{profitMarginPercent}% profit margin
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Parts Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-700">
              {totalItemsSold}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              pieces sold across all bills
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Average Bill Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {totalBillsCount > 0
                ? formatPKR(Math.round(totalRevenue / totalBillsCount))
                : "Rs. 0"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              per customer transaction
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Grid: Top-Selling Parts & Sales Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top-Selling Parts (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Top-Selling Motorcycle Parts / سب سے زیادہ بکنے والے پرزے
            </h2>
          </div>

          <Card className="glass-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Rank & Part Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-center">Qty Sold</th>
                  <th className="py-3 px-4 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {topSellingParts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Is period mein koi parts nahi bikey.
                    </td>
                  </tr>
                ) : (
                  topSellingParts.slice(0, 10).map((part, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                        <span className="h-6 w-6 rounded-full bg-slate-100 border text-slate-700 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span>{part.partName}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{part.category}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        <Badge variant="info">{part.quantity} pcs</Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {formatPKR(part.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Transaction Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Period Invoices Summary
            </h2>
          </div>

          <Card className="glass-card p-4 space-y-3">
            {activeBills.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                Is dauraan koi bill nahi bana.
              </p>
            ) : (
              activeBills.slice(0, 8).map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">
                      {b.billNumber} • {b.customerName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatDate(b.createdAt)} • {b.paymentMethod}
                    </div>
                  </div>
                  <div className="font-black text-slate-900 text-sm">
                    {formatPKR(b.grandTotal)}
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
