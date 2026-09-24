"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Part, Customer, Bill, SupplierCredit, DashboardStats } from "@/types";
import { storageService } from "./local-storage";

interface StoreContextType {
  parts: Part[];
  customers: Customer[];
  bills: Bill[];
  supplierCredits: SupplierCredit[];
  stats: DashboardStats;
  loading: boolean;
  refreshAll: () => Promise<void>;
  addPart: (part: Omit<Part, "id" | "createdAt" | "updatedAt">) => Promise<Part>;
  updatePart: (id: string, updates: Partial<Part>) => Promise<Part>;
  deletePart: (id: string) => Promise<boolean>;
  updateStock: (id: string, delta: number) => Promise<Part>;
  addCustomer: (customer: Omit<Customer, "id" | "totalSpent" | "totalVisits" | "createdAt" | "updatedAt">) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<boolean>;
  createBill: (bill: Omit<Bill, "id" | "billNumber" | "createdAt" | "status">) => Promise<Bill>;
  cancelBill: (id: string) => Promise<boolean>;
  addSupplierCredit: (credit: Omit<SupplierCredit, "id" | "paidAmount" | "remainingBalance" | "status" | "paymentHistory" | "createdAt" | "updatedAt">) => Promise<SupplierCredit>;
  recordSupplierPayment: (creditId: string, amount: number, notes?: string) => Promise<SupplierCredit>;
  deleteSupplierCredit: (id: string) => Promise<boolean>;
  resetToSampleData: () => Promise<void>;
}

const defaultStats: DashboardStats = {
  totalInventoryValue: 0,
  totalPartsCount: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  totalCustomersCount: 0,
  todaySales: 0,
  todayBillsCount: 0,
  monthlySales: 0,
  totalPendingSupplierCredit: 0,
  overdue15DaysCreditCount: 0,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [parts, setParts] = useState<Part[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [supplierCredits, setSupplierCredits] = useState<SupplierCredit[]>([]);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    try {
      const [p, c, b, sc, st] = await Promise.all([
        storageService.getParts(),
        storageService.getCustomers(),
        storageService.getBills(),
        storageService.getSupplierCredits(),
        storageService.getDashboardStats(),
      ]);
      setParts(p);
      setCustomers(c);
      setBills(b);
      setSupplierCredits(sc);
      setStats(st);
    } catch (err) {
      console.error("Failed to load store data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const addPart = async (part: Omit<Part, "id" | "createdAt" | "updatedAt">) => {
    const created = await storageService.createPart(part);
    await refreshAll();
    return created;
  };

  const updatePart = async (id: string, updates: Partial<Part>) => {
    const updated = await storageService.updatePart(id, updates);
    await refreshAll();
    return updated;
  };

  const deletePart = async (id: string) => {
    const res = await storageService.deletePart(id);
    await refreshAll();
    return res;
  };

  const updateStock = async (id: string, delta: number) => {
    const updated = await storageService.updateStock(id, delta);
    await refreshAll();
    return updated;
  };

  const addCustomer = async (
    customer: Omit<Customer, "id" | "totalSpent" | "totalVisits" | "createdAt" | "updatedAt">
  ) => {
    const created = await storageService.createCustomer(customer);
    await refreshAll();
    return created;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    const updated = await storageService.updateCustomer(id, updates);
    await refreshAll();
    return updated;
  };

  const deleteCustomer = async (id: string) => {
    const res = await storageService.deleteCustomer(id);
    await refreshAll();
    return res;
  };

  const createBill = async (bill: Omit<Bill, "id" | "billNumber" | "createdAt" | "status">) => {
    const created = await storageService.createBill(bill);
    await refreshAll();
    return created;
  };

  const cancelBill = async (id: string) => {
    const res = await storageService.cancelBill(id);
    await refreshAll();
    return res;
  };

  const addSupplierCredit = async (
    credit: Omit<
      SupplierCredit,
      "id" | "paidAmount" | "remainingBalance" | "status" | "paymentHistory" | "createdAt" | "updatedAt"
    >
  ) => {
    const created = await storageService.createSupplierCredit(credit);
    await refreshAll();
    return created;
  };

  const recordSupplierPayment = async (creditId: string, amount: number, notes?: string) => {
    const updated = await storageService.recordSupplierPayment(creditId, amount, notes);
    await refreshAll();
    return updated;
  };

  const deleteSupplierCredit = async (id: string) => {
    const res = await storageService.deleteSupplierCredit(id);
    await refreshAll();
    return res;
  };

  const resetToSampleData = async () => {
    await storageService.resetToSampleData();
    await refreshAll();
  };

  return (
    <StoreContext.Provider
      value={{
        parts,
        customers,
        bills,
        supplierCredits,
        stats,
        loading,
        refreshAll,
        addPart,
        updatePart,
        deletePart,
        updateStock,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        createBill,
        cancelBill,
        addSupplierCredit,
        recordSupplierPayment,
        deleteSupplierCredit,
        resetToSampleData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
