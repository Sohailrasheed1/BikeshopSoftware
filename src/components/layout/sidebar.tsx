"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Boxes,
  Users,
  History,
  WalletCards,
  BarChart3,
  Wrench,
  AlertTriangle,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/storage/context";
import { useSession, signOut } from "next-auth/react";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { stats } = useStore();
  const { data: session } = useSession();

  const navigation = [
    {
      name: "Dashboard",
      urdu: "کاروبار کا خلاصہ",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Fast Billing / POS",
      urdu: "بل بنائیں",
      href: "/billing",
      icon: Receipt,
      highlight: true,
    },
    {
      name: "Inventory / Stock",
      urdu: "اسٹاک کا نظام",
      href: "/inventory",
      icon: Boxes,
      badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} Low` : undefined,
      badgeVariant: "warning",
    },
    {
      name: "Customers Record",
      urdu: "کسٹمرز ریکارڈ",
      href: "/customers",
      icon: Users,
    },
    {
      name: "Bill History",
      urdu: "پرانے بلز",
      href: "/bills",
      icon: History,
    },
    {
      name: "Supplier Credit (Khata)",
      urdu: "ادھار / کھاتہ",
      href: "/suppliers",
      icon: WalletCards,
      badge: stats.overdue15DaysCreditCount > 0 ? `${stats.overdue15DaysCreditCount} Due` : undefined,
      badgeVariant: "danger",
    },
    {
      name: "Reports & Analytics",
      urdu: "کاروباری رپورٹس",
      href: "/reports",
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col h-full glass-sidebar">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200/80 flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Wrench className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
            SKANDER SPARE PARTS
          </h1>
          <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">
            Karachi, Sindh
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Main Menu / مینو
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : item.highlight
                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100/80 border border-blue-200/60"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : item.highlight ? "text-blue-600" : "text-slate-500"
                  )}
                />
                <div>
                  <div>{item.name}</div>
                  <div
                    className={cn(
                      "text-[10px] font-normal leading-none mt-0.5",
                      isActive ? "text-blue-100" : "text-slate-400"
                    )}
                  >
                    {item.urdu}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-full border",
                    item.badgeVariant === "danger"
                      ? "bg-rose-100 text-rose-700 border-rose-200 animate-pulse"
                      : "bg-amber-100 text-amber-800 border-amber-200"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Overdue Alert Strip if exists */}
      {stats.overdue15DaysCreditCount > 0 && (
        <div className="mx-4 mb-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-900">
            <span className="font-bold">{stats.overdue15DaysCreditCount} Supplier credits</span> have been pending for 15+ days.
          </div>
        </div>
      )}

      {/* User / Session Footer */}
      <div className="p-4 border-t border-slate-200/80 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {session?.user?.name || "Skander (Admin)"}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {(session?.user as any)?.role === "staff" ? "Staff Member" : "Shop Admin"}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
