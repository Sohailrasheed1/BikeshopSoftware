import { Part, Customer, Bill, SupplierCredit, DashboardStats } from "@/types";

export interface IStorageService {
  // Inventory
  getParts(): Promise<Part[]>;
  getPart(id: string): Promise<Part | null>;
  createPart(part: Omit<Part, "id" | "createdAt" | "updatedAt">): Promise<Part>;
  updatePart(id: string, updates: Partial<Part>): Promise<Part>;
  deletePart(id: string): Promise<boolean>;
  updateStock(id: string, delta: number): Promise<Part>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | null>;
  createCustomer(customer: Omit<Customer, "id" | "totalSpent" | "totalVisits" | "createdAt" | "updatedAt">): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<boolean>;

  // Bills
  getBills(): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | null>;
  createBill(bill: Omit<Bill, "id" | "billNumber" | "createdAt" | "status">): Promise<Bill>;
  cancelBill(id: string): Promise<boolean>;

  // Supplier Credit (Udhaar / Khata)
  getSupplierCredits(): Promise<SupplierCredit[]>;
  getSupplierCredit(id: string): Promise<SupplierCredit | null>;
  createSupplierCredit(credit: Omit<SupplierCredit, "id" | "paidAmount" | "remainingBalance" | "status" | "paymentHistory" | "createdAt" | "updatedAt">): Promise<SupplierCredit>;
  recordSupplierPayment(creditId: string, amount: number, notes?: string): Promise<SupplierCredit>;
  deleteSupplierCredit(id: string): Promise<boolean>;

  // Dashboard Stats
  getDashboardStats(): Promise<DashboardStats>;

  // Reset / Re-seed
  resetToSampleData(): Promise<void>;
}
