import { Part, Customer, Bill, SupplierCredit, DashboardStats } from "@/types";
import { IStorageService } from "./types";
import { SEED_PARTS, SEED_CUSTOMERS, SEED_BILLS, SEED_SUPPLIER_CREDITS } from "./seed-data";
import { daysSince } from "../utils";

const STORAGE_KEYS = {
  PARTS: "skander_parts_v1",
  CUSTOMERS: "skander_customers_v1",
  BILLS: "skander_bills_v1",
  SUPPLIER_CREDITS: "skander_supplier_credits_v1",
};

export class LocalStorageService implements IStorageService {
  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser()) return defaultValue;
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to write to localStorage for key: ${key}`, e);
    }
  }

  // --- PARTS / INVENTORY ---
  async getParts(): Promise<Part[]> {
    return this.getItem<Part[]>(STORAGE_KEYS.PARTS, SEED_PARTS);
  }

  async getPart(id: string): Promise<Part | null> {
    const parts = await this.getParts();
    return parts.find((p) => p.id === id) || null;
  }

  async createPart(partData: Omit<Part, "id" | "createdAt" | "updatedAt">): Promise<Part> {
    const parts = await this.getParts();
    const newPart: Part = {
      ...partData,
      id: `part-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    parts.unshift(newPart);
    this.setItem(STORAGE_KEYS.PARTS, parts);
    return newPart;
  }

  async updatePart(id: string, updates: Partial<Part>): Promise<Part> {
    const parts = await this.getParts();
    const index = parts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Part not found");

    const updated: Part = {
      ...parts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    parts[index] = updated;
    this.setItem(STORAGE_KEYS.PARTS, parts);
    return updated;
  }

  async deletePart(id: string): Promise<boolean> {
    const parts = await this.getParts();
    const filtered = parts.filter((p) => p.id !== id);
    this.setItem(STORAGE_KEYS.PARTS, filtered);
    return true;
  }

  async updateStock(id: string, delta: number): Promise<Part> {
    const parts = await this.getParts();
    const part = parts.find((p) => p.id === id);
    if (!part) throw new Error("Part not found");

    const newStock = Math.max(0, part.currentStock + delta);
    part.currentStock = newStock;
    part.updatedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.PARTS, parts);
    return part;
  }

  // --- CUSTOMERS ---
  async getCustomers(): Promise<Customer[]> {
    return this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
  }

  async getCustomer(id: string): Promise<Customer | null> {
    const customers = await this.getCustomers();
    return customers.find((c) => c.id === id) || null;
  }

  async createCustomer(
    customerData: Omit<Customer, "id" | "totalSpent" | "totalVisits" | "createdAt" | "updatedAt">
  ): Promise<Customer> {
    const customers = await this.getCustomers();
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      totalSpent: 0,
      totalVisits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    customers.unshift(newCustomer);
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const customers = await this.getCustomers();
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Customer not found");

    const updated: Customer = {
      ...customers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    customers[index] = updated;
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return updated;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const customers = await this.getCustomers();
    const filtered = customers.filter((c) => c.id !== id);
    this.setItem(STORAGE_KEYS.CUSTOMERS, filtered);
    return true;
  }

  // --- BILLS & INVOICING ---
  async getBills(): Promise<Bill[]> {
    return this.getItem<Bill[]>(STORAGE_KEYS.BILLS, SEED_BILLS);
  }

  async getBill(id: string): Promise<Bill | null> {
    const bills = await this.getBills();
    return bills.find((b) => b.id === id) || null;
  }

  async createBill(
    billData: Omit<Bill, "id" | "billNumber" | "createdAt" | "status">
  ): Promise<Bill> {
    const parts = await this.getParts();
    const customers = await this.getCustomers();
    const bills = await this.getBills();

    // 1. Verify Stock for all items (Prevent Over-selling)
    for (const item of billData.items) {
      const part = parts.find((p) => p.id === item.partId);
      if (!part) {
        throw new Error(`Part "${item.partName}" not found in inventory.`);
      }
      if (part.currentStock < item.quantity) {
        throw new Error(
          `Stock insufficient for "${item.partName}". Available: ${part.currentStock}, Requested: ${item.quantity}`
        );
      }
    }

    // 2. Deduct Stock automatically
    for (const item of billData.items) {
      const part = parts.find((p) => p.id === item.partId);
      if (part) {
        part.currentStock -= item.quantity;
        part.updatedAt = new Date().toISOString();
      }
    }
    this.setItem(STORAGE_KEYS.PARTS, parts);

    // 3. Generate Bill Number
    const count = bills.length + 1001;
    const billNumber = `SK-${count}`;
    const newBill: Bill = {
      ...billData,
      id: `bill-${Date.now()}`,
      billNumber,
      status: "Completed",
      createdAt: new Date().toISOString(),
    };
    bills.unshift(newBill);
    this.setItem(STORAGE_KEYS.BILLS, bills);

    // 4. Update Customer Lifetime Spend and Visits if customer exists or was selected
    if (billData.customerId) {
      const cust = customers.find((c) => c.id === billData.customerId);
      if (cust) {
        cust.totalSpent += billData.grandTotal;
        cust.totalVisits += 1;
        cust.updatedAt = new Date().toISOString();
        this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }

    return newBill;
  }

  async cancelBill(id: string): Promise<boolean> {
    const bills = await this.getBills();
    const bill = bills.find((b) => b.id === id);
    if (!bill) throw new Error("Bill not found");
    if (bill.status === "Cancelled") {
      throw new Error("Bill is already cancelled.");
    }

    // 1. Restore Stock automatically
    const parts = await this.getParts();
    for (const item of bill.items) {
      const part = parts.find((p) => p.id === item.partId);
      if (part) {
        part.currentStock += item.quantity;
        part.updatedAt = new Date().toISOString();
      }
    }
    this.setItem(STORAGE_KEYS.PARTS, parts);

    // 2. Reverse Customer Lifetime Spend
    if (bill.customerId) {
      const customers = await this.getCustomers();
      const cust = customers.find((c) => c.id === bill.customerId);
      if (cust) {
        cust.totalSpent = Math.max(0, cust.totalSpent - bill.grandTotal);
        cust.totalVisits = Math.max(0, cust.totalVisits - 1);
        cust.updatedAt = new Date().toISOString();
        this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }

    // 3. Mark Bill as Cancelled
    bill.status = "Cancelled";
    this.setItem(STORAGE_KEYS.BILLS, bills);
    return true;
  }

  // --- SUPPLIER CREDIT (UDHAAR / KHATA) ---
  async getSupplierCredits(): Promise<SupplierCredit[]> {
    return this.getItem<SupplierCredit[]>(STORAGE_KEYS.SUPPLIER_CREDITS, SEED_SUPPLIER_CREDITS);
  }

  async getSupplierCredit(id: string): Promise<SupplierCredit | null> {
    const credits = await this.getSupplierCredits();
    return credits.find((c) => c.id === id) || null;
  }

  async createSupplierCredit(
    creditData: Omit<
      SupplierCredit,
      "id" | "paidAmount" | "remainingBalance" | "status" | "paymentHistory" | "createdAt" | "updatedAt"
    >
  ): Promise<SupplierCredit> {
    const credits = await this.getSupplierCredits();
    const newCredit: SupplierCredit = {
      ...creditData,
      id: `credit-${Date.now()}`,
      paidAmount: 0,
      remainingBalance: creditData.totalAmount,
      status: "Pending",
      paymentHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    credits.unshift(newCredit);
    this.setItem(STORAGE_KEYS.SUPPLIER_CREDITS, credits);
    return newCredit;
  }

  async recordSupplierPayment(creditId: string, amount: number, notes?: string): Promise<SupplierCredit> {
    const credits = await this.getSupplierCredits();
    const credit = credits.find((c) => c.id === creditId);
    if (!credit) throw new Error("Supplier credit entry not found");

    if (amount <= 0) throw new Error("Payment amount must be greater than zero");
    if (amount > credit.remainingBalance) {
      throw new Error(`Payment amount (Rs. ${amount}) exceeds remaining balance (Rs. ${credit.remainingBalance})`);
    }

    credit.paidAmount += amount;
    credit.remainingBalance -= amount;
    credit.status = credit.remainingBalance === 0 ? "Paid" : "Partial";
    credit.paymentHistory.push({
      id: `pay-${Date.now()}`,
      amount,
      paymentDate: new Date().toISOString(),
      notes: notes || "Payment received/recorded",
    });
    credit.updatedAt = new Date().toISOString();

    this.setItem(STORAGE_KEYS.SUPPLIER_CREDITS, credits);
    return credit;
  }

  async deleteSupplierCredit(id: string): Promise<boolean> {
    const credits = await this.getSupplierCredits();
    const filtered = credits.filter((c) => c.id !== id);
    this.setItem(STORAGE_KEYS.SUPPLIER_CREDITS, filtered);
    return true;
  }

  // --- DASHBOARD STATS ---
  async getDashboardStats(): Promise<DashboardStats> {
    const parts = await this.getParts();
    const customers = await this.getCustomers();
    const bills = await this.getBills();
    const credits = await this.getSupplierCredits();

    const totalInventoryValue = parts.reduce((acc, p) => acc + p.purchasePrice * p.currentStock, 0);
    const lowStockCount = parts.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStockLimit).length;
    const outOfStockCount = parts.filter((p) => p.currentStock === 0).length;

    // Today's Sales
    const todayStr = new Date().toISOString().split("T")[0];
    const todayBills = bills.filter(
      (b) => b.status === "Completed" && b.createdAt.startsWith(todayStr)
    );
    const todaySales = todayBills.reduce((acc, b) => acc + b.grandTotal, 0);

    // Current Month's Sales
    const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
    const monthlyBills = bills.filter(
      (b) => b.status === "Completed" && b.createdAt.startsWith(currentMonthPrefix)
    );
    const monthlySales = monthlyBills.reduce((acc, b) => acc + b.grandTotal, 0);

    // Supplier Credit
    const totalPendingSupplierCredit = credits.reduce((acc, c) => acc + c.remainingBalance, 0);
    const overdue15DaysCreditCount = credits.filter(
      (c) => c.status !== "Paid" && daysSince(c.purchaseDate) >= 15
    ).length;

    return {
      totalInventoryValue,
      totalPartsCount: parts.length,
      lowStockCount,
      outOfStockCount,
      totalCustomersCount: customers.length,
      todaySales,
      todayBillsCount: todayBills.length,
      monthlySales,
      totalPendingSupplierCredit,
      overdue15DaysCreditCount,
    };
  }

  async resetToSampleData(): Promise<void> {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(SEED_PARTS));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(SEED_BILLS));
    localStorage.setItem(STORAGE_KEYS.SUPPLIER_CREDITS, JSON.stringify(SEED_SUPPLIER_CREDITS));
  }
}

export const storageService = new LocalStorageService();
