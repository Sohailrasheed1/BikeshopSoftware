"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  PlusCircle,
  RotateCcw,
  Bell,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/storage/context";

interface NavbarProps {
  onOpenMobile: () => void;
}

export function Navbar({ onOpenMobile }: NavbarProps) {
  const { stats, resetToSampleData } = useStore();
  const [time, setTime] = useState<string>("");
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        new Intl.DateTimeFormat("en-PK", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(now)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = async () => {
    await resetToSampleData();
    setResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-nav flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Live Clock / Location */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/60">
          <Clock className="h-3.5 w-3.5 text-blue-600" />
          <span>{time || "Loading time..."}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Karachi, PK</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Reset Sample Data Button */}
        {resetConfirm ? (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 p-1 rounded-xl animate-in fade-in">
            <span className="text-xs text-amber-800 font-semibold px-2">Data reset karein?</span>
            <Button
              size="sm"
              variant="danger"
              className="h-7 px-2.5 text-xs font-bold"
              onClick={handleReset}
            >
              Haan, Reset
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 px-2 text-xs"
              onClick={() => setResetConfirm(false)}
            >
              Nahi
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-medium text-slate-600 hidden md:flex items-center"
            onClick={() => setResetConfirm(true)}
            title="Reset sample data"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
            Reset Data
          </Button>
        )}

        {resetSuccess && (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Data Reset Ho Gaya!
          </div>
        )}

        {/* Low Stock Alerts Pill */}
        <Link
          href="/inventory?filter=low"
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          title="Stock Alerts (Kam Stock)"
        >
          <Bell className="h-5 w-5" />
          {(stats.lowStockCount > 0 || stats.outOfStockCount > 0) && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-ping" />
          )}
        </Link>

        {/* Quick New Bill Button */}
        <Link href="/billing">
          <Button size="sm" variant="primary" className="shadow-sm font-bold bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-4 w-4 mr-1.5" />
            <span>Naya Bill</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
